import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shell/sidebar.component';
import { TopbarComponent } from '../shell/topbar.component';
import { BreadcrumbsComponent } from '../shell/breadcrumbs.component';
import { NavLoadingBarComponent } from '../shell/nav-loading-bar.component';
import { TENANT_NAV } from './tenant-nav';
import { AuthService } from '../../core/auth/auth.service';
import { MenuService } from '../../core/menu/menu.service';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BreadcrumbsComponent, NavLoadingBarComponent],
  templateUrl: './tenant-layout.component.html',
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
