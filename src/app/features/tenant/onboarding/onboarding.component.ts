import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi, CatalogItem } from '../../admin/system-lists/system-lists.api';
import { BusinessApi } from '../../admin/business/business.api';
import { ProvisionRequest } from '../../admin/business/business.model';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Alta del negocio del dueño (post-login). Una sola llamada a /business/provision
 * crea la empresa + slug + la persona del dueño + el vínculo business_owner.
 */
@Component({
  selector: 'app-tenant-onboarding',
  standalone: true,
  imports: [DynamicFormComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-5">
      <header>
        <h1 class="text-xl font-semibold text-text">Crea tu negocio</h1>
        <p class="text-sm text-text-muted">Registra los datos de tu empresa y los tuyos como dueño.</p>
      </header>
      <app-dynamic-form [schema]="schema" [model]="model" [submitting]="saving()" (submitValue)="onSubmit($event)" />
    </div>
  `,
})
export class OnboardingComponent {
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly model = {};

  private catalog(name: string) {
    return () => this.systemListsApi.itemsEnabled(name).pipe(
      map<CatalogItem[], Option[]>(items => items.map(i => ({ value: i.id, label: i.name })))
    );
  }

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'businessTypeId', type: 'select', label: 'Tipo de negocio', width: 'half', validators: ['required'], options: this.catalog('business_type') },
      { key: 'name', type: 'text', label: 'Nombre del negocio', width: 'half', validators: ['required', { kind: 'maxLength', value: 160 }] },
      { key: 'slug', type: 'text', label: 'Subdominio', width: 'full', validators: ['required', { kind: 'pattern', value: /^[a-z0-9-]{3,63}$/, message: 'Minúsculas, números y guiones (3-63)' }] },
      { key: 'ownerDocumentTypeId', type: 'select', label: 'Tu tipo de documento', width: 'half', validators: ['required'], options: this.catalog('document_type') },
      { key: 'ownerDocumentNumber', type: 'text', label: 'Tu número de documento', width: 'half', validators: ['required', { kind: 'maxLength', value: 40 }] },
      { key: 'ownerFirstName', type: 'text', label: 'Tu nombre', width: 'half', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'ownerFirstLastName', type: 'text', label: 'Tu apellido', width: 'half', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'ownerGenderId', type: 'select', label: 'Género', width: 'half', options: this.catalog('gender') },
      { key: 'ownerBirthDate', type: 'date', label: 'Fecha de nacimiento', width: 'half' },
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
