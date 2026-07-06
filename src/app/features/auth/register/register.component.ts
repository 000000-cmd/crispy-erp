import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Loader2, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { RegisterOwnerRequest } from './register.model';

type Step = 1 | 2;

/**
 * Wizard de registro del dueño — `/login/register`. Registro MÍNIMO (solo cuenta):
 *   1. Cuenta   : nombre, apellido, correo, usuario, contraseña.
 *   2. Confirmar: revisión y envío.
 *
 * Los datos del negocio NO se piden aquí: al primer ingreso, el modal de
 * bienvenida + el widget del dashboard guían a completarlos (y pre-rellenan el
 * nombre desde esta cuenta), evitando pedir dos veces lo mismo.
 */
@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent, FieldComponent, InputComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly checkIcon = Check;
  protected readonly spinnerIcon = Loader2;
  protected readonly backIcon = ArrowLeft;

  readonly step = signal<Step>(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Paso que está "completándose" (muestra spinner sobre el número). */
  readonly advancing = signal(false);
  readonly steps = [
    { n: 1 as Step, label: 'Cuenta' },
    { n: 2 as Step, label: 'Confirmar' },
  ];

  readonly model = signal<RegisterOwnerRequest>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
  });

  /** Actualiza un campo del modelo de forma inmutable. */
  patch<K extends keyof RegisterOwnerRequest>(key: K, value: RegisterOwnerRequest[K]) {
    this.model.update(m => ({ ...m, [key]: value }));
  }

  readonly step1Valid = computed(() => {
    const m = this.model();
    return m.firstName.trim().length >= 2
      && m.lastName.trim().length >= 2
      && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)
      && m.username.trim().length >= 3
      && m.password.length >= 8;
  });

  /**
   * Avanza con feedback visual: el número del paso actual muestra un spinner,
   * luego se marca como completado (check) y avanza suave al siguiente.
   */
  next() {
    if (this.advancing()) return;
    if (this.step() === 1 && !this.step1Valid()) return;
    this.advancing.set(true);
    setTimeout(() => {
      this.step.update(v => Math.min(2, v + 1) as Step);
      this.advancing.set(false);
    }, 650);
  }

  back() {
    if (this.step() > 1) this.step.update(s => (s - 1) as Step);
  }

  /** Estado visual de cada círculo del stepper. */
  stepState(n: Step): 'done' | 'loading' | 'current' | 'todo' {
    if (this.advancing() && n === this.step()) return 'loading';
    if (n < this.step()) return 'done';
    if (n === this.step()) return 'current';
    return 'todo';
  }

  submit() {
    if (!this.step1Valid()) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth.registerOwner(this.model()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.auth.homeRoute());
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'No se pudo completar el registro. Revisa los datos e intenta de nuevo.');
      },
    });
  }
}
