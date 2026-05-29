import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import {
  LucideAngularModule, ShieldCheck, Server, Search, UserRoundPlus, ArrowRight,
  Activity, ChevronRight,
} from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PanelService } from '../../../core/panel/panel.service';
import { ServiceHealth } from '../../../core/panel/panel.api';
import { MenuService } from '../../../core/menu/menu.service';
import { ADMIN_NAV } from '../../../layouts/admin-layout/admin-nav';
import { NavItem } from '../../../layouts/shell/sidebar.types';
import { UsersApi } from '../users/users.api';
import { RolesApi } from '../roles/roles.api';

interface QuickLink { label: string; icon: any; path: string; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly panel = inject(PanelService);
  private readonly menu = inject(MenuService);
  private readonly usersApi = inject(UsersApi);
  private readonly rolesApi = inject(RolesApi);

  protected readonly addAdminIcon = UserRoundPlus;
  protected readonly arrowIcon = ArrowRight;
  protected readonly activityIcon = Activity;
  protected readonly chevron = ChevronRight;

  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? 'Administrador');
  readonly todayLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  // --- Datos reales ---
  private readonly users = toSignal(this.usersApi.list().pipe(catchError(() => of([]))), { initialValue: [] });
  private readonly roles = toSignal(this.rolesApi.list().pipe(catchError(() => of([]))), { initialValue: [] });

  private readonly authHealth   = toSignal(this.panel.authStatus());
  private readonly systemHealth = toSignal(this.panel.systemStatus());
  private readonly searchHealth = toSignal(this.panel.searchStatus());

  readonly services: { label: string; icon: any; health: () => ServiceHealth | undefined }[] = [
    { label: 'Auth',   icon: ShieldCheck, health: this.authHealth },
    { label: 'System', icon: Server,      health: this.systemHealth },
    { label: 'Search', icon: Search,      health: this.searchHealth },
  ];

  readonly userCount = computed(() => this.users().length);
  readonly superAdminCount = computed(() =>
    this.users().filter(u =>
      (u.roleCodes ?? []).includes('SYSTEM_ADMIN') ||
      (u.roles ?? []).some(r => r.code === 'SYSTEM_ADMIN'),
    ).length,
  );
  readonly roleCount = computed(() => this.roles().length);

  readonly servicesUp = computed(() => this.services.filter(s => s.health()?.status === 'UP').length);
  readonly allUp = computed(() => this.servicesUp() === this.services.length);

  // --- Accesos rápidos: derivados de los menús con ruta ---
  readonly quickLinks = computed<QuickLink[]>(() => {
    const sections = this.menu.sections().length ? this.menu.sections() : ADMIN_NAV;
    const out: QuickLink[] = [];
    const skip = new Set(['/admin/dashboard', '/admin/profile', '/admin/system-status']);
    const walk = (items: NavItem[]) => {
      for (const it of items) {
        if (it.path && !skip.has(it.path)) out.push({ label: it.label, icon: it.icon, path: it.path });
        if (it.children?.length) walk(it.children);
      }
    };
    for (const s of sections) walk(s.items);
    return out.slice(0, 5);
  });

  /** Traduce el label del menú si es clave i18n (los labels pueden venir como 'admin.users'). */
  label(key: string): string {
    void this.i18n.dict();
    return this.i18n.t(key);
  }

  dotClass(st?: string): string {
    switch (st) {
      case 'UP':       return 'bg-emerald-500';
      case 'DEGRADED': return 'bg-amber-500';
      case 'DOWN':     return 'bg-rose-500';
      default:         return 'bg-text-soft';
    }
  }
}
