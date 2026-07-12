import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { FieldConfig } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { fieldStateOf } from '../core/validation-state';
import { FieldStatusComponent, FIELD_BORDER } from '../../ui/field-status/field-status.component';
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
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TPipe, FieldStatusComponent],
  templateUrl: './text-field.component.html',
})
export class TextFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint ya resuelto por el dynamic-form (string vacio si no aplica). */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;
  readonly isPassword = computed(() => this.field().type === 'password');
  readonly revealed = signal(false);
  /** password → text mientras está revelado. */
  readonly effectiveType = computed(() => this.isPassword() && this.revealed() ? 'text' : this.htmlType());
  protected toggleReveal() { this.revealed.update(v => !v); }

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

  /** Estado visual del campo (idle/valid/error/warn) — reactivo vía `_tick`. */
  readonly state = computed(() => {
    this._tick();
    return fieldStateOf(this.control());
  });

  /** Padding derecho para no tapar el ícono de estado (y el ojo si es password). */
  readonly inputClass = computed(() => {
    const base =
      'w-full rounded-md border bg-surface text-text placeholder:text-text-soft py-2 pl-3 text-sm ' +
      'transition-all duration-200 outline-none ' +
      'focus:ring-2 focus:ring-primary-500/30';
    const pad = this.isPassword() ? 'pr-16' : 'pr-9';
    return `${base} ${pad} ${FIELD_BORDER[this.state()]}`;
  });

  readonly showError = computed(() => {
    this._tick();
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly errorMsg = computed(() => {
    this._tick();
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
