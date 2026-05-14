import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shell/sidebar.component';
import { TopbarComponent } from '../shell/topbar.component';
import { BreadcrumbsComponent } from '../shell/breadcrumbs.component';
import { NavLoadingBarComponent } from '../shell/nav-loading-bar.component';
import { ADMIN_NAV } from './admin-nav';
import { MenuService } from '../../core/menu/menu.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BreadcrumbsComponent, NavLoadingBarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly menuService = inject(MenuService);
  protected readonly i18n = inject(I18nService);

  // Si el back todavia no devuelve menus, usamos el fallback estatico para no
  // dejar al usuario sin navegacion. El backend manda la lista correcta apenas
  // /menus/me responde.
  protected readonly sections = () => {
    const fromBack = this.menuService.sections();
    return fromBack.length ? fromBack : ADMIN_NAV;
  };

  constructor() { this.menuService.load(); }
}
