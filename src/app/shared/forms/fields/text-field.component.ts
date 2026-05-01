import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Campo de texto/textarea/email/password/etc. del dynamic-form.
 *
 * Las clases del input cambian de borde segun el estado de validacion una vez
 * el usuario ha tocado o modificado el control:
 *   - rojo (`border-rose-500`) si invalido
 *   - verde (`border-emerald-500`) si valido
 *   - default + focus ring del primary mientras esta limpio
 *
 * `transition-all` da la sensacion de fluidez vista en rifasya. El label con
 * icono/tooltip/badge lo dibuja `df-field-label` desde el dynamic-form.
 */
@Component({
  selector: 'df-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  template: `
    @if (field().type === 'textarea') {
      <textarea
        [formControl]="ctrl()"
        [placeholder]="field().placeholder || ''"
        [readonly]="field().readonly || false"
        rows="4"
        [class]="inputClass()"
      ></textarea>
    } @else {
      <input
        [type]="htmlType()"
        [formControl]="ctrl()"
        [placeholder]="field().placeholder || ''"
        [readonly]="field().readonly || false"
        [class]="inputClass()"
      />
    }
    @if (showError()) {
      <p class="text-[11px] text-rose-600 mt-1">{{ errorMsg().key | t : errorMsg().params }}</p>
    } @else if (hint()) {
      <p class="text-[11px] text-text-muted mt-1">{{ hint() }}</p>
    }
  `,
})
export class TextFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint ya resuelto por el dynamic-form (string vacio si no aplica). */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

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
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly showValid = computed(() => {
    const c = this.control();
    return !c.errors && c.valid && (c.touched || c.dirty);
  });

  readonly errorMsg = computed(() => {
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
