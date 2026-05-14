import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../core/theme/theme.service';
import { TPipe } from '../../shared/pipes/t.pipe';

/**
 * Switch claro/oscuro con track y "perilla" deslizante. Reemplaza al boton
 * circular plano para encajar con el design system (transiciones suaves,
 * tokens del primary/border, accesibilidad como switch).
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TPipe],
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly sunIcon = Sun;
  protected readonly moonIcon = Moon;

  readonly isDark = computed(() => this.theme.mode() === 'dark');
}
