import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

@Component({
  selector: 'df-radio-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  template: `
    <div class="flex flex-wrap gap-x-5 gap-y-2 py-1">
      @for (o of options(); track o.value) {
        <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            [name]="field().key"
            [value]="o.value"
            [checked]="ctrl().value === o.value"
            (change)="ctrl().setValue(o.value); ctrl().markAsDirty(); ctrl().markAsTouched()"
            [disabled]="o.disabled || false"
            class="accent-primary-500"
          />
          <span>{{ o.label }}</span>
        </label>
      }
    </div>
    @if (showError()) {
      <p class="text-[11px] text-rose-600 mt-1">{{ errorMsg().key | t : errorMsg().params }}</p>
    }
  `,
})
export class RadioFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  readonly ctrl = computed(() => this.control() as any);

  readonly showError = computed(() => {
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });
  readonly errorMsg = computed(() => {
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
