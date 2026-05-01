import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/**
 * Barra fina arriba del contenido que aparece durante la navegacion del router.
 *
 * Con `PreloadAllModules` activo en `app.config.ts`, casi siempre los chunks
 * estan listos en memoria y la barra apenas parpadea. Pero queda visible
 * cuando:
 *   - El preload aun no ha terminado (justo despues del login).
 *   - La conexion es lenta o intermitente.
 *   - Algun guard async toma su tiempo en resolver.
 *
 * Implementacion: solo CSS y un signal booleano. Pequeño delay de 80ms para
 * evitar parpadeos en navegaciones instantaneas.
 */
@Component({
  selector: 'app-nav-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      aria-hidden="true"
      class="absolute top-0 left-0 right-0 h-0.5 overflow-hidden pointer-events-none z-40"
      [class.opacity-0]="!visible()"
      [class.opacity-100]="visible()"
      style="transition: opacity 150ms"
    >
      <div class="h-full bg-primary-500 animate-[nav-bar_1.2s_ease-in-out_infinite]"></div>
    </div>
  `,
  styles: [`
    @keyframes nav-bar {
      0%   { transform: translateX(-100%); width: 30%; }
      50%  { transform: translateX(50%);   width: 60%; }
      100% { transform: translateX(200%);  width: 30%; }
    }
  `],
})
export class NavLoadingBarComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = signal(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ev => {
      if (ev instanceof NavigationStart) {
        // Diferido: si la navegacion termina en <80ms (chunk ya en cache, sin
        // guards async), nunca llegamos a mostrar la barra y evitamos el
        // parpadeo molesto en navegaciones instantaneas.
        this.clearTimer();
        this.showTimer = setTimeout(() => this.visible.set(true), 80);
      } else if (
        ev instanceof NavigationEnd ||
        ev instanceof NavigationCancel ||
        ev instanceof NavigationError
      ) {
        this.clearTimer();
        this.visible.set(false);
      }
    });
  }

  private clearTimer() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }
}
