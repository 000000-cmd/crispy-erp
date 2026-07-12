import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Loader2, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthMascotService } from '../../../core/auth/auth-mascot.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { FieldState } from '../../../shared/ui/field-status/field-status.component';
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
  protected readonly mascot = inject(AuthMascotService);
  private readonly i18n = inject(I18nService);

  constructor() { this.mascot.reset(); }

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

  /** El correo ya está registrado (lo dice el back al validar en el paso 1). */
  readonly emailTaken = signal(false);

  /** Actualiza un campo del modelo de forma inmutable. */
  patch<K extends keyof RegisterOwnerRequest>(key: K, value: RegisterOwnerRequest[K]) {
    this.model.update(m => ({ ...m, [key]: value }));
    if (key === 'email') this.emailTaken.set(false); // al reescribir, se revalida
  }

  /**
   * Estado visual del campo, mismo lenguaje que el resto del sistema:
   * check al ser válido, alerta si tiene valor pero no cumple, X si está vacío
   * tras intentar continuar.
   */
  stateFor(key: keyof RegisterOwnerRequest): FieldState {
    const value = (this.model()[key] ?? '').trim();
    const invalid = !!this.fieldErrors()[key];
    if (!invalid) return value ? 'valid' : 'idle';
    if (this.showErrors()) return value ? 'warn' : 'error';
    return value ? 'warn' : 'idle';
  }

  readonly step1Valid = computed(() => {
    const m = this.model();
    return m.firstName.trim().length >= 2
      && m.lastName.trim().length >= 2
      && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)
      && m.username.trim().length >= 3
      && m.password.length >= 8;
  });

  /** El botón nunca se bloquea; al fallar mostramos el error de cada campo. */
  readonly showErrors = signal(false);
  readonly fieldErrors = computed(() => {
    const m = this.model();
    const t = (k: string) => this.i18n.t(k);
    return {
      firstName: m.firstName.trim().length >= 2 ? '' : t('validation.firstName'),
      lastName: m.lastName.trim().length >= 2 ? '' : t('validation.lastName'),
      email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)
        ? t('validation.email')
        : (this.emailTaken() ? t('validation.emailTaken') : ''),
      username: m.username.trim().length >= 3 ? '' : t('validation.username'),
      password: m.password.length >= 8 ? '' : t('validation.password'),
    };
  });

  /**
   * Avanza con feedback visual: el número del paso actual muestra un spinner,
   * luego se marca como completado (check) y avanza suave al siguiente.
   */
  next() {
    if (this.advancing()) return;
    if (this.step() !== 1) return;
    if (!this.step1Valid()) {
      this.showErrors.set(true);
      this.mascot.reject();
      return;
    }
    // Formato OK → el orb verifica que el correo no esté ya registrado:
    // loading mientras consulta; si está libre, success y avanza a confirmar;
    // si está tomado, lo marca y se queda en el paso 1.
    this.advancing.set(true);
    this.mascot.setTyping(false);
    this.mascot.setLoading(true);
    this.emailTaken.set(false);
    this.auth.emailExists(this.model().email).subscribe(exists => {
      this.mascot.setLoading(false);
      if (exists) {
        this.emailTaken.set(true);
        this.showErrors.set(true);
        this.mascot.reject();
        this.advancing.set(false);
        return;
      }
      this.mascot.celebrate();
      setTimeout(() => {
        this.step.set(2);
        this.advancing.set(false);
      }, 550);
    });
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
    this.mascot.setLoading(true);
    this.auth.registerOwner(this.model()).subscribe({
      next: () => {
        this.loading.set(false);
        this.mascot.setLoading(false);
        this.mascot.celebrate();
        this.router.navigateByUrl(this.auth.homeRoute());
      },
      error: (e) => {
        this.loading.set(false);
        this.mascot.setLoading(false);
        this.mascot.reject();
        this.error.set(e?.error?.message ?? 'No se pudo completar el registro. Revisa los datos e intenta de nuevo.');
      },
    });
  }
}
