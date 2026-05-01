import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Check, LucideAngularModule } from 'lucide-angular';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { FieldConfig } from '../core/types';

/**
 * Checkbox booleano del dynamic-form.
 *
 * Usa un input nativo oculto (sr-only) para conservar accesibilidad y la
 * integracion con reactive forms, y dibuja una caja propia con transicion
 * suave y check animado — replicando la fluidez del checkbox de rifasya
 * pero con los tokens del design system de crispy (primary, surface, border).
 *
 * El tooltip y el icono opcional se renderizan inline al lado del texto,
 * porque el dynamic-form no dibuja `df-field-label` para checkbox/switch.
 */
@Component({
  selector: 'df-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TooltipComponent],
  template: `
    <label class="inline-flex items-start gap-2 text-sm cursor-pointer group select-none">
      <input
        type="checkbox"
        class="sr-only"
        [formControl]="ctrl()"
      />

      <span
        class="mt-0.5 w-4 h-4 flex items-center justify-center
               rounded border-2 transition-all duration-200
               group-hover:border-primary-500"
        [class.bg-primary-500]="ctrl().value"
        [class.border-primary-500]="ctrl().value"
        [class.border-border]="!ctrl().value"
      >
        @if (ctrl().value) {
          <lucide-angular [img]="CheckIcon" class="w-3 h-3 text-white"></lucide-angular>
        }
      </span>

      <span class="leading-tight">
        {{ field().label }}
        @if (field().tooltip) {
          <app-tooltip
            class="ml-1 align-middle inline-flex"
            [text]="field().tooltip!"
            [variant]="field().tooltipVariant ?? 'info'"
          ></app-tooltip>
        }
      </span>
    </label>

    @if (hint()) {
      <p class="text-[11px] text-text-muted mt-1 ml-6">{{ hint() }}</p>
    }
  `,
})
export class CheckboxFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  /** Hint resuelto. */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  readonly CheckIcon = Check;
}
