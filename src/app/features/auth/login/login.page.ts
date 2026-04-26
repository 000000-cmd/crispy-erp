import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { TPipe } from '../../../shared/pipes/t.pipe';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, TPipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold text-text">{{ 'auth.welcome' | t }}</h1>
        <p class="text-sm text-text-muted mt-1">{{ 'auth.subtitle' | t }}</p>
      </div>

      <app-dynamic-form
        [schema]="schema"
        [submitting]="loading()"
        (submitValue)="onSubmit($event)"
      />

      @if (error()) {
        <p class="text-sm text-rose-600">{{ error() }}</p>
      }
    </div>
  `,
})
export class LoginPage {
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
        this.router.navigateByUrl(this.auth.homeRoute());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas');
      },
    });
  }
}
