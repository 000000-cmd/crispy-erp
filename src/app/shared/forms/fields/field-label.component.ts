import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BadgeAlert, BadgeCheck, LucideAngularModule } from 'lucide-angular';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { resolveIcon } from '../../../layouts/shell/icon-resolver';

/**
 * Label reutilizable para los campos del dynamic-form.
 *
 * Compone (de izquierda a derecha):
 *   [icono opcional]  [texto]  [* si requerido]  [tooltip ?]  [badge valido/invalido]
 *
 * El badge de validez aparece solo cuando el control esta `touched` o `dirty`,
 * para no abrumar al usuario antes de que toque el campo. La logica replica el
 * patron de rifasya (BadgeCheck/BadgeAlert), tropicalizado a los tokens de
 * tailwind del design system de crispy.
 */
@Component({
  selector: 'df-field-label',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipComponent],
  template: `
    <label
      [for]="forId()"
      class="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5"
    >
      @if (lucideIcon()) {
        <lucide-angular [img]="lucideIcon()" class="w-3.5 h-3.5 text-primary-500"></lucide-angular>
      }

      <span>{{ label() }}</span>

      @if (required()) {
        <span class="text-rose-500">*</span>
      }

      @if (tooltip()) {
        <app-tooltip [text]="tooltip()!" [variant]="tooltipVariant()"></app-tooltip>
      }

      @if (showStateBadge()) {
        <lucide-angular
          [img]="hasError() ? InvalidIcon : ValidIcon"
          class="w-3.5 h-3.5 ml-auto"
          [class.text-rose-500]="hasError()"
          [class.text-emerald-500]="!hasError()"
        ></lucide-angular>
      }
    </label>
  `,
})
export class FieldLabelComponent {
  readonly forId = input<string>('');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly tooltip = input<string | undefined>(undefined);
  readonly tooltipVariant = input<'info' | 'warning' | 'error'>('info');
  readonly control = input<AbstractControl | null>(null);

  readonly ValidIcon = BadgeCheck;
  readonly InvalidIcon = BadgeAlert;

  readonly lucideIcon = computed(() => {
    const name = this.icon();
    return name ? resolveIcon(name) : null;
  });

  readonly showStateBadge = computed(() => {
    const c = this.control();
    return !!c && (c.touched || c.dirty);
  });

  readonly hasError = computed(() => {
    const c = this.control();
    return !!c?.invalid && (c.touched || c.dirty);
  });
}
