import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { FormCompanionComponent } from '../../../shared/ui/form-companion/form-companion.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';
import { BusinessApi } from '../../admin/business/business.api';
import { ProvisionRequest } from '../../admin/business/business.model';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConstantsService } from '../../../core/constants/constants.service';
import { I18nService } from '../../../core/i18n/i18n.service';

type Step = 1 | 2;

/**
 * Alta del negocio del dueño (post-login). Se divide en dos pasos para no
 * sofocar al usuario: 1) Negocio (tipo, nombre, subdominio) y 2) Tus datos
 * (documento y datos del dueño). El provision es una sola llamada al final.
 */
@Component({
  selector: 'app-tenant-onboarding',
  standalone: true,
  imports: [DynamicFormComponent, PageHeaderComponent, FormCompanionComponent, ButtonComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly constants = inject(ConstantsService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly saving = signal(false);
  readonly step = signal<Step>(1);
  readonly steps = [{ n: 1 as Step, label: 'Negocio' }, { n: 2 as Step, label: 'Tus datos' }];

  // Acumula los valores de ambos pasos. Pre-rellena tu nombre/apellido desde la
  // cuenta (ya se pidieron en el registro; quedan editables por si difieren).
  readonly acc = signal<Record<string, any>>({
    ownerFirstName: this.auth.user()?.firstName ?? '',
    ownerFirstLastName: this.auth.user()?.lastName ?? '',
  });

  readonly companionMessage = computed(() =>
    this.i18n.t(this.step() === 1 ? 'companion.onboarding.step1' : 'companion.onboarding.step2'),
  );

  private catalog(name: string) {
    return () => this.systemListsApi.itemsEnabled(name).pipe(
      map<CatalogItem[], Option[]>(items => items.map(i => ({ value: i.id, label: i.name })))
    );
  }

  private toSlug(text: string): string {
    return (text ?? '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 63);
  }

  readonly businessSchema: FormSchema = {
    cols: 1,
    fields: [
      { key: 'businessTypeId', type: 'select', label: 'Tipo de negocio', validators: ['required'], options: this.catalog('business_type') },
      {
        key: 'name', type: 'text', label: 'Nombre del negocio', validators: ['required', { kind: 'maxLength', value: 160 }],
        // Sugiere el subdominio mientras el usuario no lo haya editado a mano.
        hooks: { onChange: (v, ctx) => {
          const slug = ctx.form.get('slug');
          if (slug && !slug.dirty) slug.setValue(this.toSlug(v), { emitEvent: false });
        } },
      },
      { key: 'slug', type: 'text', label: 'Subdominio', validators: ['required', { kind: 'pattern', value: /^[a-z0-9-]{3,63}$/, message: 'Minúsculas, números y guiones (3-63)' }] },
    ],
    submit: { label: 'Continuar' },
  };

  readonly ownerSchema: FormSchema = {
    cols: 1,
    fields: [
      { key: 'ownerDocumentTypeId', type: 'select', label: 'Tu tipo de documento', validators: ['required'], options: this.catalog('document_type') },
      { key: 'ownerDocumentNumber', type: 'text', label: 'Tu número de documento', validators: ['required', { kind: 'maxLength', value: 40 }] },
      { key: 'ownerFirstName', type: 'text', label: 'Tu nombre', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'ownerFirstLastName', type: 'text', label: 'Tu apellido', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'ownerGenderId', type: 'select', label: 'Género', options: this.catalog('gender') },
      // Mayoría de edad por constante MAYEDAD (si está inhabilitada/no existe, se omite).
      { key: 'ownerBirthDate', type: 'date', label: 'Fecha de nacimiento', validators: [{ async: this.constants.legalAgeValidator() }] },
    ],
    submit: { label: 'Crear mi negocio' },
  };

  /** Paso 1 válido → guarda y avanza. (dynamic-form solo emite si es válido.) */
  onBusinessSubmit(v: Record<string, any>) {
    this.acc.update(a => ({ ...a, ...v }));
    this.step.set(2);
  }

  back() { this.step.set(1); }

  onOwnerSubmit(v: Record<string, any>) {
    this.saving.set(true);
    const payload: ProvisionRequest = { ...this.acc(), ...v, ownerUserId: this.auth.user()?.id ?? null } as ProvisionRequest;
    this.businessApi.provision(payload).subscribe({
      next: (res) => {
        // Hidrata el businessId en sesión: el gate deja pasar al dashboard y el
        // onboarding deja de ser una opción (redirige) de aquí en adelante.
        this.auth.setBusinessId(res.businessId);
        this.toast.success('¡Negocio creado correctamente!');
        this.saving.set(false);
        this.router.navigateByUrl('/tenant/dashboard');
      },
      error: () => this.saving.set(false),
    });
  }
}
