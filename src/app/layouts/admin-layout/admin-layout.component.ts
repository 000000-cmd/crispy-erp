import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shell/sidebar.component';
import { TopbarComponent } from '../shell/topbar.component';
import { BreadcrumbsComponent } from '../shell/breadcrumbs.component';
import { NavLoadingBarComponent } from '../shell/nav-loading-bar.component';
import { ADMIN_NAV } from './admin-nav';
import { MenuService } from '../../core/menu/menu.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BreadcrumbsComponent, NavLoadingBarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-bg text-text">
      <app-sidebar brand="ERP Moda" subtitle="Admin sistema" [sections]="sections()" />
      <div class="flex-1 flex flex-col min-w-0 relative">
        <app-nav-loading-bar />
        <app-topbar><app-breadcrumbs /></app-topbar>
        <main class="flex-1 overflow-auto">
          <div class="max-w-[1400px] mx-auto p-6 lg:p-8">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly menuService = inject(MenuService);

  // Si el back todavia no devuelve menus, usamos el fallback estatico para no
  // dejar al usuario sin navegacion. El backend manda la lista correcta apenas
  // /menus/me responde.
  protected readonly sections = () => {
    const fromBack = this.menuService.sections();
    return fromBack.length ? fromBack : ADMIN_NAV;
  };

  constructor() { this.menuService.load(); }
}
