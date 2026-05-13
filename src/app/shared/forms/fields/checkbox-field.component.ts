import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { FieldConfig } from '../core/types';

/**
 * Checkbox booleano del dynamic-form. Wrapper sobre el CheckboxComponent
 * compartido para mantener un look consistente con el resto del UI.
 */
@Component({
  selector: 'df-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckboxComponent, TooltipComponent],
  template: `
    <div class="inline-flex items-start gap-2">
      <app-checkbox [formControl]="ctrl()" />

      <span class="text-sm leading-tight">
        {{ field().label }}
        @if (field().tooltip) {
          <app-tooltip
            class="ml-1 align-middle inline-flex"
            [text]="field().tooltip!"
            [variant]="field().tooltipVariant ?? 'info'"
          ></app-tooltip>
        }
      </span>
    </div>

    @if (hint()) {
      <p class="text-[11px] text-text-muted mt-1 ml-6">{{ hint() }}</p>
    }
  `,
})
export class CheckboxFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);
}
