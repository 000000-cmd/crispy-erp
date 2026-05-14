import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Campo de texto/textarea/email/password/etc. del dynamic-form.
 *
 * Estados visuales (cuando el control esta touched o dirty):
 *   - rojo (`border-rose-500`) si invalido
 *   - verde (`border-emerald-500`) si valido
 *   - default mientras esta limpio
 *
 * Sobre la reactividad: AbstractControl no expone signals, asi que
 * suscribimos a `events` (statusChanges/valueChanges/touchedChanges) y
 * disparamos un tick. De lo contrario, llamar `markAllAsTouched()` no
 * propaga al template y los bordes/iconos se quedan stale.
 */
@Component({
  selector: 'df-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  templateUrl: './text-field.component.html',
})
export class TextFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint ya resuelto por el dynamic-form (string vacio si no aplica). */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  /** Reactividad sobre touched/dirty/errors (no son signals nativas). */
  private readonly _tick = controlTick(this.control);

  readonly htmlType = computed(() => {
    const t = this.field().type;
    if (t === 'email') return 'email';
    if (t === 'password') return 'password';
    if (t === 'number') return 'number';
    if (t === 'date') return 'date';
    if (t === 'time') return 'time';
    if (t === 'datetime') return 'datetime-local';
    if (t === 'color') return 'color';
    if (t === 'hidden') return 'hidden';
    return 'text';
  });

  readonly inputClass = computed(() => {
    const base =
      'w-full rounded-md border bg-surface text-text placeholder:text-text-soft px-3 py-2 text-sm ' +
      'transition-all duration-200 outline-none ' +
      'focus:ring-2 focus:ring-primary-500/30';
    return `${base} ${this.borderClass()}`;
  });

  readonly borderClass = computed(() => {
    if (this.showError()) return 'border-rose-500 focus:border-rose-500';
    if (this.showValid()) return 'border-emerald-500 focus:border-emerald-500';
    return 'border-border focus:border-primary-500';
  });

  readonly showError = computed(() => {
    this._tick();
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly showValid = computed(() => {
    this._tick();
    const c = this.control();
    return !c.errors && c.valid && (c.touched || c.dirty);
  });

  readonly errorMsg = computed(() => {
    this._tick();
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
