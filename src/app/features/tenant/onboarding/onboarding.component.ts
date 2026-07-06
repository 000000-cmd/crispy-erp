import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';
import { BusinessApi } from '../../admin/business/business.api';
import { ProvisionRequest } from '../../admin/business/business.model';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConstantsService } from '../../../core/constants/constants.service';

/**
 * Alta del negocio del dueño (post-login). Una sola llamada a /business/provision
 * crea la empresa + slug + la persona del dueño + el vínculo business_owner.
 */
@Component({
  selector: 'app-tenant-onboarding',
  standalone: true,
  imports: [DynamicFormComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly constants = inject(ConstantsService);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  // Pre-rellena tu nombre/apellido desde la cuenta: ya se pidieron en el
  // registro, no se vuelven a escribir (quedan editables por si difieren).
  readonly model = {
    ownerFirstName: this.auth.user()?.firstName ?? '',
    ownerFirstLastName: this.auth.user()?.lastName ?? '',
  };

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

  readonly schema: FormSchema = {
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

  onSubmit(v: any) {
    this.saving.set(true);
    const payload: ProvisionRequest = { ...v, ownerUserId: this.auth.user()?.id ?? null };
    this.businessApi.provision(payload).subscribe({
      next: () => {
        this.toast.success('¡Negocio creado correctamente!');
        this.saving.set(false);
        this.router.navigateByUrl('/tenant/dashboard');
      },
      error: () => this.saving.set(false),
    });
  }
}
