import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BrandingService } from '../../core/branding/branding.service';
import { LandingComponent } from '../landing/landing.component';
import { TenantLandingComponent } from './tenant-landing.component';
import { LandingApi } from './landing.api';
import { PublicLanding } from './landing.model';

/**
 * Home (`/`). Decide qué landing pintar según el host:
 *  - Con slug de tenant (subdominio o `?tenant=` en dev) y página PUBLICADA →
 *    la landing personalizada del negocio (tematizada con su paleta, que el
 *    BrandingService ya aplicó en el arranque).
 *  - Sin tenant, slug inexistente o página sin publicar → la landing del
 *    producto (la de venta del SaaS).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LandingComponent, TenantLandingComponent],
  template: `
    @if (!ready()) {
      <!-- Evita el flash de la landing del producto mientras resuelve el tenant. -->
      <div class="min-h-screen bg-bg"></div>
    } @else if (tenantData(); as data) {
      <app-tenant-landing [data]="data" />
    } @else {
      <app-landing />
    }
  `,
})
export class HomeComponent {
  private readonly branding = inject(BrandingService);
  private readonly landingApi = inject(LandingApi);

  readonly ready = signal(false);
  readonly tenantData = signal<PublicLanding | null>(null);

  constructor() {
    const slug = this.branding.slug();
    if (!slug) { this.ready.set(true); return; }
    this.landingApi.publicLanding(slug).subscribe({
      next: data => { this.tenantData.set(data); this.ready.set(true); },
      error: () => this.ready.set(true),
    });
  }
}
