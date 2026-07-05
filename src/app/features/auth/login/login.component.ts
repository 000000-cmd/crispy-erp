import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BrandingService } from '../../../core/branding/branding.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';

/**
 * Login del DUEÑO / usuario de un negocio (tenant). Entrada por defecto
 * (`/login`). Refleja el branding resuelto por subdominio y enlaza al wizard de
 * registro. El acceso de administradores del sistema vive en `/login/admin`.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly branding = inject(BrandingService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly schema: FormSchema = {
    cols: 1,
    fields: [
      {
        key: 'usernameOrEmail',
        type: 'text',
        label: 'Usuario o correo',
        placeholder: 'usuario  /  tu@empresa.com',
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
    this.auth.login({ usernameOrEmail: value['usernameOrEmail'], password: value['password'] }).subscribe({
      next: () => {
        this.loading.set(false);
        // Separación de accesos: un administrador NO entra por la ruta común.
        if (this.auth.kind() === 'SYSTEM_ADMIN') {
          this.auth.handleAuthFailure(false);
          this.error.set('Los administradores ingresan por su acceso dedicado.');
          return;
        }
        // La web es para dueños (y admins por su ruta): los empleados usan el APK.
        const roles = this.auth.user()?.roles ?? [];
        if (roles.includes('EMPLOYEE') && !roles.includes('OWNER')) {
          this.auth.handleAuthFailure(false);
          this.error.set('Las cuentas de empleado ingresan por la app móvil.');
          return;
        }
        this.router.navigateByUrl(this.auth.homeRoute());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas');
      },
    });
  }
}
