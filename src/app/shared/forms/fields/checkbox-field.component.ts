import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';

@Component({
  selector: 'df-checkbox-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" [formControl]="ctrl()" class="accent-primary-500" />
      <span>{{ field().label }}</span>
    </label>
  `,
})
export class CheckboxFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly ctrl = computed(() => this.control() as any);
}
