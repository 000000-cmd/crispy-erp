import { Component, inject } from '@angular/core';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../../core/theme/theme.service';

/**
 * Switch día/noche: toggle propio, ligero y sin desync — el estado visual se
 * deriva directamente de `theme.mode()`, así nunca queda la cara de día en modo
 * oscuro (problema del `.riv`, cuya animación corría por tiempo, no por estado,
 * y además traía su propio fondo = ruido visual). Es un `<button>` real
 * (accesible). Conserva el contrato E2E: el knob lleva `.app-knob`
 * (selector `button:has(.app-knob)`).
 */
@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      (click)="theme.toggleMode()"
      [attr.aria-label]="theme.mode() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
      [attr.aria-pressed]="theme.mode() === 'dark'"
      class="theme-switch"
      [class.is-dark]="theme.mode() === 'dark'">
      <span class="theme-switch__track" aria-hidden="true">
        <lucide-icon [img]="sun" [size]="12" class="theme-switch__ico theme-switch__ico--sun" />
        <lucide-icon [img]="moon" [size]="12" class="theme-switch__ico theme-switch__ico--moon" />
        <span class="app-knob theme-switch__knob"></span>
      </span>
    </button>
  `,
})
export class ThemeSwitchComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly sun = Sun;
  protected readonly moon = Moon;
}
