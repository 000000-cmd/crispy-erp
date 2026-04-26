import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { SwitchComponent } from '../../ui/switch/switch.component';
import { FieldConfig } from '../core/types';

@Component({
  selector: 'df-switch-field',
  standalone: true,
  imports: [ReactiveFormsModule, SwitchComponent],
  template: `
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm">{{ field().label }}</span>
      <app-switch [formControl]="ctrl()" />
    </div>
  `,
})
export class SwitchFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly ctrl = computed(() => this.control() as any);
}
