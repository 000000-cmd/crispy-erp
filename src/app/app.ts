import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';
import { I18nService } from './core/i18n/i18n.service';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';
import { ConfirmHostComponent } from './shared/ui/confirm/confirm-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmHostComponent],
  template: `
    <router-outlet />
    <app-toast-container />
    <app-confirm-host />
  `,
})
export class App {
  // Boot core services.
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
}
