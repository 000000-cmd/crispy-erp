import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';

/**
 * Login de ADMINISTRADORES del sistema (`/login/admin`). Deliberadamente plano
 * y SIN branding de tenant: el administrador no pertenece a ningún negocio, así
 * que esta pantalla nunca se tematiza por subdominio. Reusa el mismo flujo de
 * autenticación; el destino lo decide `homeRoute()` según el rol.
 */
@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

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
    this.auth.login({ usernameOrEmail: value['usernameOrEmail'], password: value['password'] }).subscribe({
      next: () => {
        this.loading.set(false);
        // Este acceso es EXCLUSIVO de administradores del sistema.
        if (this.auth.kind() !== 'SYSTEM_ADMIN') {
          this.auth.handleAuthFailure(false);
          this.error.set('Este acceso es exclusivo para administradores.');
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
