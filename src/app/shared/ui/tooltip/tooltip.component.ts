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
  template: `
    <span class="relative inline-flex items-center group/tip">
      <lucide-angular
        [img]="HelpIcon"
        class="w-3.5 h-3.5 text-text-muted cursor-help"
        tabindex="0"
      ></lucide-angular>

      <span
        class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-20
               whitespace-pre w-max max-w-xs rounded-md border px-2.5 py-1.5
               text-[11px] leading-snug text-left
               opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100
               transition-opacity duration-200"
        [class]="bodyClass()"
      >
        <span [innerHTML]="text()"></span>
        <span
          class="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0
                 border-x-4 border-x-transparent border-t-4"
          [class]="arrowClass()"
        ></span>
      </span>
    </span>
  `,
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
