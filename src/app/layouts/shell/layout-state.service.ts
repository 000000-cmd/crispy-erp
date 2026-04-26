import { Injectable, computed, effect, signal } from '@angular/core';

export type SidebarMode = 'expanded' | 'collapsed';

const STORAGE_KEY = 'erp.sidebar';

@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  private readonly _mode = signal<SidebarMode>(this.load());
  readonly mode = this._mode.asReadonly();
  readonly isCollapsed = computed(() => this._mode() === 'collapsed');

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this._mode());
    });
  }

  set(mode: SidebarMode) { this._mode.set(mode); }
  toggle() { this._mode.set(this.isCollapsed() ? 'expanded' : 'collapsed'); }

  private load(): SidebarMode {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'collapsed' ? 'collapsed' : 'expanded';
  }
}
