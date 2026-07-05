import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, map, catchError } from 'rxjs';
import { LucideAngularModule, MapPin, Users, Scissors, ChevronRight, Building2, Smartphone } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AppVersionsApi } from '../../admin/app-versions/app-versions.api';
import { BusinessApi } from '../../admin/business/business.api';
import { Business } from '../../admin/business/business.model';
import { SedesApi } from '../sedes/sedes.api';
import { ServiciosApi } from '../servicios/servicios.api';
import { EmpleadosApi } from '../empleados/empleados.api';
import { Kpi } from './dashboard.model';

/**
 * Panel del dueño — SOLO datos reales del back: su negocio (/business/mine) y
 * los conteos de sedes, empleados y servicios. Las métricas de operación
 * (citas/ingresos) llegarán cuando exista el módulo de agendamiento.
 */
@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent],
  templateUrl: './dashboard.component.html',
})
export class TenantDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly businessApi = inject(BusinessApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly empleadosApi = inject(EmpleadosApi);
  private readonly appVersionsApi = inject(AppVersionsApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly chevron = ChevronRight;
  protected readonly businessIcon = Building2;
  protected readonly appIcon = Smartphone;

  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? '');
  readonly loading = signal(true);
  readonly business = signal<Business | null>(null);
  readonly branchCount = signal(0);
  readonly employeeCount = signal(0);
  readonly offeringCount = signal(0);

  readonly kpis = computed<Kpi[]>(() => [
    { key: 'sedes', label: 'Sedes', value: this.branchCount(), icon: MapPin, route: '/tenant/sedes' },
    { key: 'empleados', label: 'Empleados', value: this.employeeCount(), icon: Users, route: '/tenant/empleados' },
    { key: 'servicios', label: 'Servicios', value: this.offeringCount(), icon: Scissors, route: '/tenant/servicios' },
  ]);

  constructor() { this.load(); }

  private load() {
    const userId = this.auth.user()?.id;
    if (!userId) { this.loading.set(false); return; }

    this.businessApi.mine(userId).pipe(
      switchMap(list => {
        const b = list[0] ?? null;
        this.business.set(b);
        if (!b) return of(null);
        return forkJoin({
          branches: this.sedesApi.list(b.id).pipe(catchError(() => of([]))),
          offerings: this.serviciosApi.list(b.id).pipe(catchError(() => of([]))),
        }).pipe(
          switchMap(({ branches, offerings }) => {
            this.branchCount.set(branches.length);
            this.offeringCount.set(offerings.length);
            if (!branches.length) return of(null);
            // Total de empleados = suma de las sedes (endpoint es por sede).
            return forkJoin(
              branches.map(br => this.empleadosApi.listDetailed(br.id).pipe(catchError(() => of([])))),
            ).pipe(map(lists => this.employeeCount.set(lists.flat().length)));
          }),
        );
      }),
      catchError(() => of(null)),
    ).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  go(route: string) { this.router.navigateByUrl(route); }

  /** Link estable de descarga del APK (siempre la versión vigente). */
  copyAppLink() {
    navigator.clipboard.writeText(this.appVersionsApi.latestDownloadUrl())
      .then(() => this.toast.success('Link de la app copiado. Compártelo con tu equipo.'));
  }
}
