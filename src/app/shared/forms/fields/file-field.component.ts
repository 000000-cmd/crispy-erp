import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';

@Component({
  selector: 'df-file-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './file-field.component.html',
})
export class FileFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint resuelto por el dynamic-form. */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  onPick(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.ctrl().setValue(f);
    this.ctrl().markAsDirty();
    this.ctrl().markAsTouched();
  }
}
