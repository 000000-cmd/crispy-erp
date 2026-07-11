import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronDown, ChevronRight, LogOut } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LayoutStateService } from './layout-state.service';
import { NavItem, NavSection } from './sidebar.types';
import { TPipe } from '../../shared/pipes/t.pipe';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';

interface FlyoutState {
  rootKey: string;
  label: string;
  items: NavItem[];
  topPx: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, TPipe, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly brand = input<string>('ERP Moda');
  readonly subtitle = input<string>('');
  readonly sections = input.required<NavSection[]>();

  /** Iniciales de la marca para el logotipo (deriva del nombre, sin hardcode). */
  readonly brandInitials = computed(() =>
    this.brand().split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('') || 'S');

  /** Nombre visible del usuario para el avatar/footer. */
  readonly userName = computed(() => {
    const u = this.auth.user();
    return u?.fullName || u?.email || '';
  });

  protected readonly layout = inject(LayoutStateService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  /** Traduce si el label es una clave del diccionario, si no lo devuelve tal cual. */
  lbl(key: string): string {
    // dependencia explicita para que cambios de locale repinten
    void this.i18n.dict();
    const v = this.i18n.t(key);
    // i18n.t() devuelve el key sin tocar cuando no existe -> mismo string => literal.
    return v;
  }

  protected readonly down = ChevronDown;
  protected readonly right = ChevronRight;
  protected readonly logoutIcon = LogOut;

  private readonly openKeys = signal<Record<string, boolean>>({});
  protected readonly flyout = signal<FlyoutState | null>(null);
  private closeTimer: any = null;

  isOpen(key: string): boolean {
    const o = this.openKeys();
    if (key in o) return o[key];
    const sec = this.sections().find(s => s.key === key);
    return sec?.defaultOpen ?? true;
  }

  toggleSection(key: string) {
    this.openKeys.update(s => ({ ...s, [key]: !this.isOpen(key) }));
  }

  linkClass(depth: number): string {
    const base = 'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors';
    return `${base}${depth > 0 ? ' pl-6' : ''}`;
  }

  goProfile() {
    this.router.navigateByUrl(this.auth.kind() === 'SYSTEM_ADMIN' ? '/admin/profile' : '/tenant/profile');
  }

  // -------- Flyout (modo collapsed) --------

  onItemHover(section: NavSection, item: NavItem, ev: MouseEvent) {
    if (!this.layout.isCollapsed()) return;
    this.cancelClose();
    const target = (ev.currentTarget as HTMLElement);
    const rect = target.getBoundingClientRect();
    const items = item.children?.length ? item.children : (item.path ? [item] : section.items);
    this.flyout.set({
      rootKey: item.key,
      label: item.label,
      items: items.filter(i => !!i.path || !!i.children?.length),
      topPx: Math.max(8, rect.top),
    });
  }

  onItemLeave() {
    this.cancelClose();
    this.closeTimer = setTimeout(() => this.flyout.set(null), 180);
  }

  cancelClose() {
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
  }

  closeFlyout() { this.flyout.set(null); }
}
