import { Injectable, signal } from '@angular/core';

/**
 * Puente de UI entre las páginas de autenticación (login / register / admin) y
 * la mascota que vive en el `auth-layout`. Las páginas escriben aquí desde
 * eventos que YA ocurren (foco, escritura, submit, éxito, error) y el layout
 * los refleja en la mascota. No añade lógica ni flujos: sólo estado visual.
 *
 * `celebrate` / `reject` / `jump` son pulsos (contadores) para que el host los
 * consuma vía `effect` — cada incremento dispara la animación una vez.
 */
@Injectable({ providedIn: 'root' })
export class AuthMascotService {
  /** Hay un campo con foco / el usuario está escribiendo. */
  readonly typing = signal(false);
  /** Hay un envío en curso. */
  readonly loading = signal(false);

  readonly celebratePulse = signal(0);
  readonly rejectPulse = signal(0);
  readonly jumpPulse = signal(0);

  setTyping(value: boolean): void { this.typing.set(value); }
  setLoading(value: boolean): void { this.loading.set(value); }

  celebrate(): void { this.celebratePulse.update((n) => n + 1); }
  reject(): void { this.rejectPulse.update((n) => n + 1); }
  jump(): void { this.jumpPulse.update((n) => n + 1); }

  /** Estado neutro al montar/cambiar de página de auth. */
  reset(): void {
    this.typing.set(false);
    this.loading.set(false);
  }
}
