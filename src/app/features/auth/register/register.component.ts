import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Loader2, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { RegisterOwnerRequest } from './register.model';

type Step = 1 | 2 | 3;

/**
 * Wizard de registro de negocio (alta de dueño) — `/login/register`.
 *
 * Por pasos y con info mínima:
 *   1. Negocio  : nombre + subdominio (se sugiere a partir del nombre).
 *   2. Dueño    : nombre, apellido, correo, usuario, contraseña.
 *   3. Confirmar: revisión y envío.
 *
 * Al enviar, `auth.registerOwner` crea la cuenta con rol OWNER y deja la sesión
 * lista, así que navegamos directo al panel del dueño.
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
    { n: 1 as Step, label: 'Negocio' },
    { n: 2 as Step, label: 'Dueño' },
    { n: 3 as Step, label: 'Confirmar' },
  ];

  readonly model = signal<RegisterOwnerRequest>({
    businessName: '',
    slug: '',
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

  /** Al escribir el nombre del negocio sugerimos un slug. */
  onBusinessName(value: string) {
    this.model.update(m => ({
      ...m,
      businessName: value,
      slug: m.slug && m.slug !== this.toSlug(m.businessName) ? m.slug : this.toSlug(value),
    }));
  }

  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 63);
  }

  readonly step1Valid = computed(() => {
    const m = this.model();
    return m.businessName.trim().length >= 2 && /^[a-z0-9-]{3,63}$/.test(m.slug);
  });

  readonly step2Valid = computed(() => {
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
    const s = this.step();
    if (this.advancing()) return;
    if ((s === 1 && !this.step1Valid()) || (s === 2 && !this.step2Valid())) return;
    this.advancing.set(true);
    setTimeout(() => {
      this.step.update(v => Math.min(3, v + 1) as Step);
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
    if (!this.step1Valid() || !this.step2Valid()) return;
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
