import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { MenusApi } from './menus.api';
import { MenuNode } from './menu.model';
import { resolveIcon } from '../../layouts/shell/icon-resolver';
import { NavItem, NavSection } from '../../layouts/shell/sidebar.types';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(MenusApi);
  private readonly auth = inject(AuthService);

  private readonly _tree = signal<MenuNode[]>([]);
  readonly tree = this._tree.asReadonly();
  readonly loaded = signal(false);
  readonly loading = signal(false);

  constructor() {
    // Sincronizar el arbol de menus con el ciclo de vida del usuario:
    // login -> cargar; logout -> limpiar.
    effect(() => {
      const user = this.auth.user();
      if (user) this.load();
      else this.reset();
    });
  }

  /** Secciones derivadas: cada nodo raiz se considera una "seccion" del sidebar. */
  readonly sections = computed<NavSection[]>(() => {
    const roots = [...this._tree()].sort(byOrder);
    return roots.map(root => ({
      key: root.code || root.id,
      label: root.name,
      defaultOpen: true,
      items: root.children?.length
        ? [...root.children].sort(byOrder).map(toNavItem)
        : [toNavItem(root)],
    }));
  });

  load(force = false) {
    if (this.loaded() && !force) return;
    this.loading.set(true);
    this.api.myTree().pipe(
      tap(t => {
        this._tree.set(t || []);
        this.loaded.set(true);
        this.loading.set(false);
      }),
    ).subscribe({ error: () => this.loading.set(false) });
  }

  reset() { this._tree.set([]); this.loaded.set(false); }
}

function byOrder(a: MenuNode, b: MenuNode) { return (a.displayOrder ?? 0) - (b.displayOrder ?? 0); }

function toNavItem(n: MenuNode): NavItem {
  const kids = (n.children ?? []).filter(c => c.enabled !== false && c.visible !== false).sort(byOrder);
  return {
    key: n.code || n.id,
    label: n.name,
    icon: resolveIcon(n.icon),
    path: n.route || undefined,
    children: kids.length ? kids.map(toNavItem) : undefined,
  };
}
