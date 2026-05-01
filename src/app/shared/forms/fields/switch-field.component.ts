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
  template: `
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm flex items-center gap-1.5">
        {{ field().label }}
        @if (field().tooltip) {
          <app-tooltip
            [text]="field().tooltip!"
            [variant]="field().tooltipVariant ?? 'info'"
          ></app-tooltip>
        }
      </span>
      <app-switch [formControl]="ctrl()" />
    </div>
    @if (hint()) {
      <p class="text-[11px] text-text-muted mt-1">{{ hint() }}</p>
    }
  `,
})
export class SwitchFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint resuelto. */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);
}
