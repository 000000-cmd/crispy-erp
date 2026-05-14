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
  templateUrl: './nav-loading-bar.component.html',
  styleUrl: './nav-loading-bar.component.scss',
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
