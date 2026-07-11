import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { resolveIcon } from '../../../layouts/shell/icon-resolver';

/**
 * Label reutilizable para los campos del dynamic-form.
 *
 * Composicion: [* requerido]  [icono opcional]  [texto]  [tooltip ?]
 *
 * El estado de validación (check / X / alerta) lo muestra el propio control
 * (input/select) para no duplicar la señal en el label.
 */
@Component({
  selector: 'df-field-label',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipComponent],
  templateUrl: './field-label.component.html',
})
export class FieldLabelComponent {
  readonly forId = input<string>('');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly tooltip = input<string | undefined>(undefined);
  readonly tooltipVariant = input<'info' | 'warning' | 'error'>('info');
  /** Se mantiene por compatibilidad con el binding del dynamic-form. */
  readonly control = input<AbstractControl | null>(null);

  readonly lucideIcon = computed(() => {
    const name = this.icon();
    return name ? resolveIcon(name) : null;
  });
}
