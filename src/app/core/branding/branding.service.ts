import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../http/api.service';
import { MICROSERVICES, ms } from '../http/microservices';
import { paletteFromHex } from '../theme/palettes';
import { Branding } from './branding.model';

/**
 * Resuelve y aplica el branding de una empresa a partir del slug del host.
 *
 * Diseño:
 *  - Detecta el slug del `hostname` (o de `?tenant=` para desarrollo local).
 *  - Pide el branding público (sin JWT) a business-service.
 *  - Aplica el color primario a las variables CSS `--p-*` DIRECTAMENTE (sin pasar
 *    por ThemeService) para NO contaminar el tema guardado del usuario: el branding
 *    es contextual al tenant, no una preferencia personal.
 *  - Expone `branding()` (name, logo, etc.) para que el login del dueño se
 *    personalice (logo + nombre del negocio).
 */
@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly api = inject(ApiService);

  /** Hosts que NO representan un tenant (no se intenta resolver branding). */
  private static readonly NON_TENANT_HOSTS = new Set(['www', 'app', 'admin', 'localhost', '127']);

  private readonly _branding = signal<Branding | null>(null);
  private readonly _resolved = signal(false);

  readonly branding = this._branding.asReadonly();
  /** True cuando ya se intentó resolver (haya o no tenant). */
  readonly resolved = this._resolved.asReadonly();
  readonly hasTenant = computed(() => !!this._branding());
  readonly slug = computed(() => this._branding()?.slug ?? this.detectSlug());

  /**
   * Detecta el slug del tenant.
   *  - `barberia-x.miapp.com`  -> 'barberia-x'
   *  - `localhost?tenant=demo` -> 'demo' (atajo de desarrollo)
   *  - host sin slug o reservado -> null
   */
  detectSlug(): string | null {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('tenant');
    if (override) return override.trim().toLowerCase();

    const host = window.location.hostname;
    const labels = host.split('.');
    if (labels.length < 3) return null; // sin slug (ej. miapp.com / localhost)
    const sub = labels[0].toLowerCase();
    return BrandingService.NON_TENANT_HOSTS.has(sub) ? null : sub;
  }

  /**
   * Resuelve el branding una sola vez. Idempotente: si ya se resolvió, reusa
   * el valor en memoria. Pensado para llamarse en el arranque de la app
   * (APP_INITIALIZER) y antes de pintar el login.
   */
  resolve(): Observable<Branding | null> {
    if (this._resolved()) return of(this._branding());

    const sub = this.detectSlug();
    if (!sub) {
      this._resolved.set(true);
      return of(null);
    }

    return this.api.get<Branding | null>(ms(MICROSERVICES.BUSINESS, 'public/branding'), { slug: sub }).pipe(
      catchError(() => of(null)),
      tap(b => {
        this._branding.set(b ?? null);
        this._resolved.set(true);
        if (b?.primaryColor) this.applyPrimary(b.primaryColor);
      }),
      map(b => b ?? null),
    );
  }

  /** Limpia el branding aplicado (vuelve al tema del usuario en el siguiente render). */
  clear(): void {
    this._branding.set(null);
  }

  /**
   * Aplica un color primario (hex) a la escala `--p-50..900`, replicando lo que
   * hace ThemeService.applyPalette pero sin tocar su estado persistente.
   */
  private applyPrimary(hex: string): void {
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    const p = paletteFromHex(normalized);
    const root = document.documentElement;
    (['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const)
      .forEach(k => root.style.setProperty(`--p-${k}`, p.scale[Number(k) as keyof typeof p.scale]));
  }
}
