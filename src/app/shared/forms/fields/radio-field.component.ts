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
  templateUrl: './radio-field.component.html',
})
export class RadioFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  /** Hint resuelto por el dynamic-form. */
  readonly hint = input<string>('');
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
