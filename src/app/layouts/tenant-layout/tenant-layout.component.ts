import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shell/sidebar.component';
import { TopbarComponent } from '../shell/topbar.component';
import { BreadcrumbsComponent } from '../shell/breadcrumbs.component';
import { TENANT_NAV } from './tenant-nav';
import { AuthService } from '../../core/auth/auth.service';
import { MenuService } from '../../core/menu/menu.service';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BreadcrumbsComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-bg text-text">
      <app-sidebar brand="ERP Moda" [subtitle]="subtitle()" [sections]="sections()" />
      <div class="flex-1 flex flex-col min-w-0">
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
export class TenantLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly menuService = inject(MenuService);

  protected readonly sections = () => {
    const fromBack = this.menuService.sections();
    return fromBack.length ? fromBack : TENANT_NAV;
  };

  protected subtitle() {
    const u = this.auth.user();
    return u?.fullName ? `Hola, ${u.fullName.split(' ')[0]}` : 'Operación';
  }

  constructor() { this.menuService.load(); }
}
