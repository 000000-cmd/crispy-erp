import { Injectable, computed, effect, signal } from '@angular/core';

export type SidebarMode = 'expanded' | 'collapsed';

const STORAGE_KEY = 'erp.sidebar';
const MOBILE_QUERY = '(max-width: 1023px)'; // < lg de Tailwind

@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  private readonly _mode = signal<SidebarMode>(this.load());
  readonly mode = this._mode.asReadonly();

  /** Viewport bajo el breakpoint lg: el sidebar pasa a off-canvas. */
  readonly isMobile = signal(false);
  /** En móvil, si el panel off-canvas está abierto. */
  readonly mobileOpen = signal(false);

  /** Colapsado solo aplica en escritorio; en móvil el panel siempre va expandido. */
  readonly isCollapsed = computed(() => !this.isMobile() && this._mode() === 'collapsed');

  constructor() {
    effect(() => { localStorage.setItem(STORAGE_KEY, this._mode()); });

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia(MOBILE_QUERY);
      const apply = (matches: boolean) => {
        this.isMobile.set(matches);
        if (!matches) this.mobileOpen.set(false); // al crecer, cerramos el overlay
      };
      apply(mq.matches);
      mq.addEventListener('change', e => apply(e.matches));
    }
  }

  set(mode: SidebarMode) { this._mode.set(mode); }
  toggle() { this._mode.set(this._mode() === 'collapsed' ? 'expanded' : 'collapsed'); }

  /** Botón hamburguesa: en móvil abre/cierra overlay; en escritorio colapsa. */
  toggleSidebar() {
    if (this.isMobile()) this.mobileOpen.update(v => !v);
    else this.toggle();
  }
  closeMobile() { this.mobileOpen.set(false); }

  private load(): SidebarMode {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'collapsed' ? 'collapsed' : 'expanded';
  }
}
