import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

@Component({
  selector: 'df-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  template: `
    <select
      [formControl]="ctrl()"
      [multiple]="field().type === 'multiselect'"
      [class]="inputClass()"
    >
      @if (field().type !== 'multiselect') {
        <option [ngValue]="null" disabled>{{ field().placeholder || 'Selecciona…' }}</option>
      }
      @for (o of options(); track o.value) {
        <option [ngValue]="o.value" [disabled]="o.disabled || false">{{ o.label }}</option>
      }
    </select>
    @if (showError()) {
      <p class="text-[11px] text-rose-600 mt-1">{{ errorMsg().key | t : errorMsg().params }}</p>
    } @else if (field().hint) {
      <p class="text-[11px] text-text-muted mt-1">{{ field().hint }}</p>
    }
  `,
})
export class SelectFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  readonly ctrl = computed(() => this.control() as any);

  readonly inputClass = computed(() => {
    const base = 'w-full rounded-md border bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30';
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
