import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HelpCircle, LucideAngularModule } from 'lucide-angular';

/**
 * Tooltip ligero (CSS puro, sin overlay manager). Por defecto se renderiza
 * como un icono `?` que al hover/focus muestra el contenido. Pensado para
 * aclaraciones cortas en labels de formulario.
 *
 * - Variante `info` (gris/oscuro), `warning` (amarillo) y `error` (rojo)
 *   usan tokens de Tailwind compatibles con el design system de crispy.
 * - El texto admite HTML simple via [innerHTML].
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
  readonly text = input<string>('');
  readonly variant = input<'info' | 'warning' | 'error'>('info');

  readonly HelpIcon = HelpCircle;

  bodyClass() {
    switch (this.variant()) {
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'error':   return 'bg-rose-50 text-rose-800 border-rose-200';
      default:        return 'bg-surface text-text border-border shadow-md';
    }
  }

  arrowClass() {
    switch (this.variant()) {
      case 'warning': return 'border-t-amber-200';
      case 'error':   return 'border-t-rose-200';
      default:        return 'border-t-border';
    }
  }
}
