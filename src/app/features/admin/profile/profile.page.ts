import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ThemeService } from '../../../core/theme/theme.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/http/api.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, CardComponent, DynamicFormComponent],
  template: `
    <div class="space-y-6 max-w-4xl">
      <header>
        <h1 class="text-xl font-semibold text-text">Mi perfil</h1>
        <p class="text-sm text-text-muted">Tu información, preferencias visuales e idioma.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-card title="Información personal">
          <p class="text-sm"><span class="text-text-muted">Correo:</span> {{ auth.user()?.email }}</p>
          <p class="text-sm mt-1"><span class="text-text-muted">Nombre:</span> {{ auth.user()?.fullName || '—' }}</p>
          <p class="text-sm mt-1"><span class="text-text-muted">Roles:</span> {{ auth.user()?.roles?.join(', ') || '—' }}</p>
        </app-card>

        <app-card title="Cambiar contraseña">
          <app-dynamic-form [schema]="passwordSchema" [submitting]="saving()" (submitValue)="changePassword($event)" />
        </app-card>

        <app-card title="Tema">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm">Modo</span>
              <div class="inline-flex border border-border rounded-md overflow-hidden text-xs">
                <button class="px-3 py-1.5" [class.bg-primary-500]="theme.mode() === 'light'" [class.text-white]="theme.mode() === 'light'" (click)="theme.setMode('light')">Claro</button>
                <button class="px-3 py-1.5" [class.bg-primary-500]="theme.mode() === 'dark'" [class.text-white]="theme.mode() === 'dark'" (click)="theme.setMode('dark')">Oscuro</button>
              </div>
            </div>

            <div>
              <p class="text-sm mb-2">Paleta predefinida</p>
              <div class="flex flex-wrap gap-2">
                @for (p of theme.palettes; track p.id) {
                  <button
                    class="h-9 w-9 rounded-md border-2 transition-all"
                    [style.background]="p.scale[500]"
                    [class.border-primary-700]="theme.paletteId() === p.id"
                    [class.border-transparent]="theme.paletteId() !== p.id"
                    [title]="p.label"
                    (click)="theme.setPalette(p.id)"
                  ></button>
                }
              </div>
            </div>

            <div>
              <p class="text-sm mb-2">Color personalizado</p>
              <div class="flex items-center gap-2">
                <input type="color" [value]="theme.customHex() || '#a13a2c'" (input)="onHex($event)"
                       class="h-9 w-12 rounded-md border border-border bg-transparent cursor-pointer" />
                <input type="text" [value]="theme.customHex() || ''" placeholder="#rrggbb"
                       (change)="onHex($event)"
                       class="flex-1 h-9 px-3 rounded-md border border-border bg-surface text-sm" />
                @if (theme.paletteId() === 'custom') {
                  <span class="text-xs text-text-muted">Activa</span>
                }
              </div>
            </div>
          </div>
        </app-card>

        <app-card title="Idioma">
          <div class="inline-flex border border-border rounded-md overflow-hidden text-sm">
            @for (l of i18n.available; track l) {
              <button
                class="px-4 py-1.5"
                [class.bg-primary-500]="i18n.locale() === l"
                [class.text-white]="i18n.locale() === l"
                (click)="i18n.setLocale(l)"
              >{{ l.toUpperCase() }}</button>
            }
          </div>
        </app-card>
      </div>
    </div>
  `,
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
    this.api.post('users/me/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword }).subscribe({
      next: () => { this.toast.success('Contraseña actualizada'); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }

  onHex(e: Event) {
    const hex = (e.target as HTMLInputElement).value;
    if (/^#[0-9a-f]{6}$/i.test(hex)) this.theme.setCustomHex(hex);
  }
}
