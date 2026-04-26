import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LucideAngularModule, Bell, Moon, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';
import { ThemeService } from '../../core/theme/theme.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LayoutStateService } from './layout-state.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="h-14 border-b border-border bg-surface/80 backdrop-blur flex items-center px-3 gap-2 sticky top-0 z-30">
      <button
        class="h-9 w-9 rounded-md hover:bg-surface-hover inline-flex items-center justify-center text-text-muted hover:text-text transition-colors"
        (click)="layout.toggle()"
        [title]="layout.isCollapsed() ? 'Expandir menú' : 'Contraer menú'"
      >
        <lucide-icon [img]="layout.isCollapsed() ? openIcon : closeIcon" [size]="16"></lucide-icon>
      </button>

      <div class="flex-1 min-w-0 px-1">
        <ng-content />
      </div>

      <select
        class="text-xs bg-transparent border border-border hover:border-border-strong rounded-md px-2 py-1.5 text-text-muted cursor-pointer transition-colors"
        [value]="i18n.locale()"
        (change)="i18n.setLocale($any($event.target).value)"
        title="Idioma"
      >
        @for (l of i18n.available; track l) {
          <option [value]="l">{{ l.toUpperCase() }}</option>
        }
      </select>

      <button
        class="h-9 w-9 rounded-md hover:bg-surface-hover inline-flex items-center justify-center text-text-muted hover:text-text transition-colors"
        (click)="theme.toggleMode()"
        [title]="theme.mode() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
      >
        <lucide-icon [img]="theme.mode() === 'dark' ? sunIcon : moonIcon" [size]="16"></lucide-icon>
      </button>

      <button class="h-9 w-9 rounded-md hover:bg-surface-hover inline-flex items-center justify-center text-text-muted hover:text-text relative transition-colors">
        <lucide-icon [img]="bellIcon" [size]="16"></lucide-icon>
        <span class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
      </button>
    </header>
  `,
})
export class TopbarComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly layout = inject(LayoutStateService);
  protected readonly bellIcon = Bell;
  protected readonly moonIcon = Moon;
  protected readonly sunIcon = Sun;
  protected readonly openIcon = PanelLeftOpen;
  protected readonly closeIcon = PanelLeftClose;
}
