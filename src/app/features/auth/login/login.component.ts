import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthMascotService } from '../../../core/auth/auth-mascot.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BrandingService } from '../../../core/branding/branding.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { TPipe } from '../../../shared/pipes/t.pipe';

/**
 * Login del DUEÑO / usuario de un negocio (tenant). Entrada por defecto
 * (`/login`). Refleja el branding resuelto por subdominio y enlaza al wizard de
 * registro. El acceso de administradores del sistema vive en `/login/admin`.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, RouterLink, TPipe],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly branding = inject(BrandingService);
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
        label: 'Usuario, correo o documento',
        placeholder: 'usuario  /  tu@empresa.com  /  nº documento',
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
        // Separación de accesos: un administrador NO entra por la ruta común.
        if (this.auth.kind() === 'SYSTEM_ADMIN') {
          this.auth.handleAuthFailure(false);
          this.mascot.reject();
          this.error.set(this.i18n.t('auth.error.adminUseDedicated'));
          return;
        }
        // La web es para dueños (y admins por su ruta): los empleados usan el APK.
        const roles = this.auth.user()?.roles ?? [];
        if (roles.includes('EMPLOYEE') && !roles.includes('OWNER')) {
          this.auth.handleAuthFailure(false);
          this.mascot.reject();
          this.error.set(this.i18n.t('auth.error.employeeUseApp'));
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
