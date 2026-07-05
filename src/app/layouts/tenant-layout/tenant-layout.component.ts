import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shell/sidebar.component';
import { TopbarComponent } from '../shell/topbar.component';
import { BreadcrumbsComponent } from '../shell/breadcrumbs.component';
import { NavLoadingBarComponent } from '../shell/nav-loading-bar.component';
import { AuthService } from '../../core/auth/auth.service';
import { MenuService } from '../../core/menu/menu.service';

/**
 * Layout del dueño (tenant). El sidebar consume EXCLUSIVAMENTE los menús
 * configurados por rol en BD (/system/menus/me) — sin fallback estático:
 * lo que ve el dueño es lo que el admin configuró para su rol.
 */
@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BreadcrumbsComponent, NavLoadingBarComponent],
  templateUrl: './tenant-layout.component.html',
})
export class TenantLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly menuService = inject(MenuService);

  protected readonly sections = this.menuService.sections;

  protected subtitle() {
    const u = this.auth.user();
    return u?.fullName ? `Hola, ${u.fullName.split(' ')[0]}` : 'Operación';
  }

  constructor() { this.menuService.load(); }
}
