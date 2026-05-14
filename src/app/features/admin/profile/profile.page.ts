import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ThemeService } from '../../../core/theme/theme.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, CardComponent, DynamicFormComponent],
  templateUrl: './profile.page.html',
})
export class AdminProfilePage {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);

  readonly passwordSchema: FormSchema = {
    cols: 1,
    fields: [
      { key: 'currentPassword', type: 'password', label: 'Contraseña actual', validators: ['required'] },
      { key: 'newPassword', type: 'password', label: 'Nueva contraseña', validators: ['required', { kind: 'minLength', value: 8 }] },
      { key: 'confirm', type: 'password', label: 'Confirmar', validators: ['required',
        c => c.value && c.parent?.get('newPassword')?.value !== c.value ? { match: { message: 'No coincide' } } : null,
      ]},
    ],
    submit: { label: 'Actualizar contraseña' },
  };

  changePassword(v: any) {
    this.saving.set(true);
    this.api.post(ms(MICROSERVICES.AUTH, 'users/me/change-password'), { currentPassword: v.currentPassword, newPassword: v.newPassword }).subscribe({
      next: () => { this.toast.success('Contraseña actualizada'); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }

  onHex(e: Event) {
    const hex = (e.target as HTMLInputElement).value;
    if (/^#[0-9a-f]{6}$/i.test(hex)) this.theme.setCustomHex(hex);
  }
}
