import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { fieldStateOf } from '../core/validation-state';
import { FieldStatusComponent, FIELD_BORDER } from '../../ui/field-status/field-status.component';
import { TPipe } from '../../pipes/t.pipe';
import { maskThousands, parseCOP } from '../../util/money';

/**
 * Campo de dinero (COP) del dynamic-form: input de texto con máscara de miles
 * EN VIVO (`25000 → "25.000"`) y prefijo `$`. El control guarda el number
 * limpio (o null), así que los validators `min`/`required` operan sobre el
 * valor real y el payload al back no lleva strings enmascarados.
 */
@Component({
  selector: 'df-money-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe, FieldStatusComponent],
  templateUrl: './money-field.component.html',
})
export class MoneyFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly hint = input<string>('');

  /** Reactividad sobre touched/dirty/errors/value (no son signals nativas). */
  private readonly _tick = controlTick(this.control);

  /** Valor enmascarado que pinta el input, derivado del number del control. */
  readonly masked = computed(() => {
    this._tick();
    const v = this.control().value;
    return typeof v === 'number' ? maskThousands(v) : '';
  });

  readonly state = computed(() => {
    this._tick();
    return fieldStateOf(this.control());
  });

  readonly inputClass = computed(() => {
    const base =
      'w-full rounded-md border bg-surface text-text placeholder:text-text-soft py-2 pl-8 pr-9 text-sm ' +
      'transition-all duration-200 outline-none tabular-nums ' +
      'focus:ring-2 focus:ring-primary-500/30';
    return `${base} ${FIELD_BORDER[this.state()]}`;
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

  /**
   * Re-enmascara en cada tecla preservando la posición RELATIVA del caret
   * (contada en dígitos desde la izquierda) para que escribir en medio no
   * salte al final.
   */
  onInput(el: HTMLInputElement): void {
    const digitsBeforeCaret = (el.value.slice(0, el.selectionStart ?? el.value.length).match(/\d/g) ?? []).length;
    const value = parseCOP(el.value);
    this.control().setValue(value);
    this.control().markAsDirty();

    const next = value == null ? '' : maskThousands(value);
    el.value = next;
    // Reubicar el caret tras el mismo número de dígitos.
    let pos = 0, seen = 0;
    while (pos < next.length && seen < digitsBeforeCaret) {
      if (/\d/.test(next[pos])) seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
  }

  onBlur(): void {
    this.control().markAsTouched();
  }
}
