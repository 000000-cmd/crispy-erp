import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthMascotService } from '../../../core/auth/auth-mascot.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { TPipe } from '../../../shared/pipes/t.pipe';

/**
 * Login de ADMINISTRADORES del sistema (`/login/admin`). Deliberadamente plano
 * y SIN branding de tenant: el administrador no pertenece a ningún negocio, así
 * que esta pantalla nunca se tematiza por subdominio. Reusa el mismo flujo de
 * autenticación; el destino lo decide `homeRoute()` según el rol.
 */
@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, RouterLink, TPipe],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly mascot = inject(AuthMascotService);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() { this.mascot.reset(); }

  readonly schema: FormSchema = {
    cols: 1,
    fields: [
      {
        key: 'usernameOrEmail',
        type: 'text',
        label: 'Usuario o correo',
        placeholder: 'admin  /  admin@sistema.com',
        validators: ['required'],
      },
      {
        key: 'password',
        type: 'password',
        label: 'Contraseña',
        placeholder: '••••••••',
        validators: ['required', { kind: 'minLength', value: 6 }],
      },
    ],
    submit: { label: 'Iniciar sesión' },
  };

  onSubmit(value: Record<string, any>) {
    this.error.set(null);
    this.loading.set(true);
    this.mascot.setLoading(true);
    this.auth.login({ usernameOrEmail: value['usernameOrEmail'], password: value['password'] }).subscribe({
      next: () => {
        this.loading.set(false);
        this.mascot.setLoading(false);
        // Este acceso es EXCLUSIVO de administradores del sistema.
        if (this.auth.kind() !== 'SYSTEM_ADMIN') {
          this.auth.handleAuthFailure(false);
          this.mascot.reject();
          this.error.set(this.i18n.t('auth.error.adminOnly'));
          return;
        }
        this.mascot.celebrate();
        this.router.navigateByUrl(this.auth.homeRoute());
      },
      error: () => {
        this.loading.set(false);
        this.mascot.setLoading(false);
        this.mascot.reject();
        this.error.set(this.i18n.t('auth.error.invalidCredentials'));
      },
    });
  }
}
