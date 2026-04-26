import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronDown, ChevronRight, LogOut } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutStateService } from './layout-state.service';
import { NavItem, NavSection } from './sidebar.types';

interface FlyoutState {
  rootKey: string;
  label: string;
  items: NavItem[];
  topPx: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside
      class="relative h-screen bg-surface border-r border-border flex flex-col transition-[width] duration-200 ease-out"
      [style.width.px]="layout.isCollapsed() ? 64 : 256"
    >
      <!-- Brand -->
      <div class="h-14 px-3 flex items-center gap-2.5 border-b border-border shrink-0">
        <div class="h-9 w-9 rounded-md bg-primary-500 text-white inline-flex items-center justify-center text-sm font-semibold shrink-0">EM</div>
        @if (!layout.isCollapsed()) {
          <div class="min-w-0 transition-opacity duration-150">
            <p class="text-sm font-semibold text-text truncate leading-tight">{{ brand() }}</p>
            <p class="text-[11px] text-text-muted truncate leading-tight">{{ subtitle() }}</p>
          </div>
        }
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-2">
        @for (section of sections(); track section.key) {
          <div class="mb-1">
            @if (!layout.isCollapsed()) {
              <button
                type="button"
                class="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-soft hover:text-text-muted"
                (click)="toggleSection(section.key)"
              >
                <span>{{ section.label }}</span>
                <lucide-icon [img]="isOpen(section.key) ? down : right" [size]="11"></lucide-icon>
              </button>
            } @else {
              <div class="h-px mx-3 my-1 bg-border"></div>
            }

            @if (layout.isCollapsed() || isOpen(section.key)) {
              <ul class="space-y-0.5 px-2">
                @for (item of section.items; track item.key) {
                  <li
                    class="relative"
                    (mouseenter)="onItemHover(section, item, $event)"
                    (mouseleave)="onItemLeave()"
                  >
                    <ng-container *ngTemplateOutlet="navTpl; context: { $implicit: item, depth: 0 }"></ng-container>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </nav>

      <!-- User footer -->
      <div class="border-t border-border p-2 shrink-0">
        <button
          class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-hover transition-colors text-left"
          (click)="goProfile()"
          [title]="layout.isCollapsed() ? (auth.user()?.fullName || auth.user()?.email || '') : ''"
        >
          <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 inline-flex items-center justify-center text-[11px] font-semibold shrink-0">
            {{ initials() }}
          </div>
          @if (!layout.isCollapsed()) {
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-text truncate leading-tight">{{ auth.user()?.fullName || auth.user()?.email }}</p>
              <p class="text-[10px] text-text-muted truncate leading-tight">{{ auth.user()?.email }}</p>
            </div>
            <button class="text-text-muted hover:text-rose-600 p-1 rounded-md" (click)="$event.stopPropagation(); auth.logout()" title="Cerrar sesión">
              <lucide-icon [img]="logoutIcon" [size]="14"></lucide-icon>
            </button>
          }
        </button>
      </div>
    </aside>

    <!-- Flyout: solo en modo collapsed cuando hay hover sobre un item -->
    @if (layout.isCollapsed() && flyout(); as fly) {
      <div
        class="fixed z-[60] left-[64px] ml-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 animate-fadeIn"
        [style.top.px]="fly.topPx"
        (mouseenter)="cancelClose()"
        (mouseleave)="onItemLeave()"
      >
        <div class="px-3 pb-2 border-b border-border mb-1">
          <p class="text-[11px] uppercase tracking-wider text-text-soft">{{ fly.label }}</p>
        </div>
        <ul class="space-y-0.5 px-1.5">
          @for (item of fly.items; track item.key) {
            @if (item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-text hover:bg-surface-hover"
                  (click)="closeFlyout()"
                >
                  @if (item.icon) { <lucide-icon [img]="item.icon" [size]="14" class="shrink-0 text-text-muted"></lucide-icon> }
                  <span class="flex-1 truncate">{{ item.label }}</span>
                </a>
              </li>
            }
          }
        </ul>
      </div>
    }

    <!-- Templates -->
    <ng-template #navTpl let-item let-depth="depth">
      @if (item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200 font-medium"
          [class]="linkClass(depth)"
          [title]="layout.isCollapsed() ? item.label : ''"
        >
          @if (item.icon) { <lucide-icon [img]="item.icon" [size]="16" class="shrink-0"></lucide-icon> }
          @if (!layout.isCollapsed()) {
            <span class="flex-1 truncate">{{ item.label }}</span>
            @if (item.badge != null) {
              <span class="text-[10px] bg-surface-muted text-text-muted px-1.5 py-0.5 rounded">{{ item.badge }}</span>
            }
          }
        </a>
      } @else {
        @if (!layout.isCollapsed()) {
          <button
            type="button"
            [class]="linkClass(depth) + ' w-full text-left'"
            (click)="toggleSection(item.key)"
          >
            @if (item.icon) { <lucide-icon [img]="item.icon" [size]="16" class="shrink-0"></lucide-icon> }
            <span class="flex-1 truncate">{{ item.label }}</span>
            <lucide-icon [img]="isOpen(item.key) ? down : right" [size]="12"></lucide-icon>
          </button>

          @if (isOpen(item.key) && item.children?.length) {
            <ul class="space-y-0.5 mt-0.5">
              @for (child of item.children; track child.key) {
                <li>
                  <ng-container *ngTemplateOutlet="navTpl; context: { $implicit: child, depth: depth + 1 }"></ng-container>
                </li>
              }
            </ul>
          }
        } @else {
          <button
            type="button"
            class="flex items-center justify-center h-9 w-9 mx-auto rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
            [title]="item.label"
          >
            @if (item.icon) { <lucide-icon [img]="item.icon" [size]="16"></lucide-icon> }
          </button>
        }
      }
    </ng-template>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
    .animate-fadeIn { animation: fadeIn 120ms ease-out; }
  `],
})
export class SidebarComponent {
  readonly brand = input<string>('ERP Moda');
  readonly subtitle = input<string>('');
  readonly sections = input.required<NavSection[]>();

  protected readonly layout = inject(LayoutStateService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly down = ChevronDown;
  protected readonly right = ChevronRight;
  protected readonly logoutIcon = LogOut;

  private readonly openKeys = signal<Record<string, boolean>>({});
  protected readonly flyout = signal<FlyoutState | null>(null);
  private closeTimer: any = null;

  readonly initials = computed(() => {
    const u = this.auth.user();
    const name = u?.fullName || u?.email || '?';
    return name.split(/\s+|@/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('');
  });

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
