import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { SwitchComponent } from '../../ui/switch/switch.component';
import { FieldConfig } from '../core/types';

/**
 * Toggle del dynamic-form. Tooltip opcional inline porque el dynamic-form
 * no dibuja `df-field-label` para switch/checkbox.
 */
@Component({
  selector: 'df-switch-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SwitchComponent, TooltipComponent],
  templateUrl: './switch-field.component.html',
})
export class SwitchFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint resuelto. */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);
}
