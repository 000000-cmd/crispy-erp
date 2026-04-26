import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

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
    } @else if (field().hint) {
      <p class="text-[11px] text-text-muted mt-1">{{ field().hint }}</p>
    }
  `,
})
export class TextFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
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
    const base = 'w-full rounded-md border bg-surface text-text placeholder:text-text-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30';
    const errored = this.showError() ? 'border-rose-500' : 'border-border focus:border-primary-500';
    return `${base} ${errored}`;
  });

  readonly showError = computed(() => {
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly errorMsg = computed(() => {
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
