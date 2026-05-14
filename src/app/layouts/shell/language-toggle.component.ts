import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Locale } from '../../core/i18n/dictionaries';

/**
 * Selector de idioma como segmented control. Cada locale es un boton; el
 * activo se marca con bg primary y se desliza un indicador.
 *
 * Reemplaza el <select> nativo del topbar para encajar con el design system.
 */
@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-toggle.component.html',
})
export class LanguageToggleComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly locales: Locale[] = ['es', 'en'];

  protected btnClass(active: boolean): string {
    const base =
      'inline-flex items-center justify-center px-2.5 h-6 rounded text-[11px] font-semibold ' +
      'transition-all duration-200 cursor-pointer ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40';
    return active
      ? `${base} bg-primary-500 text-white shadow-sm`
      : `${base} text-text-muted hover:text-text hover:bg-surface-hover`;
  }

  protected set(l: Locale) { this.i18n.setLocale(l); }
}
