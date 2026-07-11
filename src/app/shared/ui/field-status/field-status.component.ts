import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, CircleCheck, CircleX, TriangleAlert } from 'lucide-angular';

/**
 * Estado visual de un campo, común a TODO el sistema de formularios:
 *   - `idle`  : sin interacción → sin adorno.
 *   - `valid` : válido → borde verde + check.
 *   - `error` : falla una validación principal (ej. requerido vacío) → borde rojo + X.
 *   - `warn`  : lleno pero no cumple una condición (ej. correo inválido) → borde ámbar + alerta.
 */
export type FieldState = 'idle' | 'valid' | 'error' | 'warn';

/** Clases de borde por estado (foco a nivel del propio input). */
export const FIELD_BORDER: Record<FieldState, string> = {
  idle:  'border-border focus:border-primary-500',
  valid: 'border-emerald-500 focus:border-emerald-500',
  error: 'border-rose-500 focus:border-rose-500',
  warn:  'border-amber-500 focus:border-amber-500',
};

/** Ícono de estado del campo (X / alerta / check) con su color. Decorativo. */
@Component({
  selector: 'app-field-status',
  standalone: true,
  imports: [LucideAngularModule],
  template: `@if (glyph()) {
    <lucide-icon [img]="glyph()!" [size]="size()" [class]="color()" aria-hidden="true" />
  }`,
})
export class FieldStatusComponent {
  readonly state = input<FieldState>('idle');
  readonly size = input<number>(16);

  protected readonly glyph = computed(
    () => ({ idle: null, valid: CircleCheck, error: CircleX, warn: TriangleAlert })[this.state()],
  );
  protected readonly color = computed(
    () => ({ idle: '', valid: 'text-emerald-500', error: 'text-rose-500', warn: 'text-amber-500' })[this.state()],
  );
}
