import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../core/types';

@Component({
  selector: 'df-file-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <input
      type="file"
      (change)="onPick($event)"
      class="block w-full text-sm text-text file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer hover:file:bg-primary-600"
    />
  `,
})
export class FileFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly ctrl = computed(() => this.control() as any);

  onPick(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.ctrl().setValue(f);
    this.ctrl().markAsDirty();
    this.ctrl().markAsTouched();
  }
}
