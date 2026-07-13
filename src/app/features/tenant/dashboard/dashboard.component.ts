import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, map, catchError } from 'rxjs';
import { LucideAngularModule, MapPin, Users, Scissors, ChevronRight, Building2, Smartphone, CheckCircle2, Circle } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { MascotComponent } from '../../../shared/ui/mascot/mascot.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AppVersionsApi } from '../../admin/app-versions/app-versions.api';
import { BusinessApi } from '../../admin/business/business.api';
import { Business } from '../../admin/business/business.model';
import { SedesApi } from '../sedes/sedes.api';
import { ServiciosApi } from '../servicios/servicios.api';
import { EmpleadosApi } from '../empleados/empleados.api';
import { CompletionStep, Kpi } from './dashboard.model';

/**
 * Panel del dueño — SOLO datos reales del back: su negocio (/business/mine) y
 * los conteos de sedes, empleados y servicios. Las métricas de operación
 * (citas/ingresos) llegarán cuando exista el módulo de agendamiento.
 */
@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent, ModalComponent, MascotComponent, SkeletonComponent],
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
  private readonly i18n = inject(I18nService);

  protected readonly chevron = ChevronRight;
  protected readonly businessIcon = Building2;
  protected readonly appIcon = Smartphone;
  protected readonly stepDoneIcon = CheckCircle2;
  protected readonly stepTodoIcon = Circle;

  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? '');

  /**
   * Mensaje de bienvenida "generativo" del lado del cliente: compone saludo por
   * hora del día + nombre + una apertura que rota por día. Sin llamadas externas.
   */
  readonly welcomeMessage = computed(() => {
    const name = this.greeting();
    const hi = name ? `, ${name}` : '';
    const h = new Date().getHours();
    const daypart = this.i18n.t(h < 12 ? 'welcome.morning' : h < 19 ? 'welcome.afternoon' : 'welcome.evening');
    const openers = ['welcome.opener1', 'welcome.opener2', 'welcome.opener3'];
    return this.i18n.t(openers[new Date().getDate() % openers.length], { daypart, hi });
  });

  readonly loading = signal(true);
  readonly business = signal<Business | null>(null);
  readonly branchCount = signal(0);
  readonly employeeCount = signal(0);
  readonly offeringCount = signal(0);

  // ----- Completar empresa: pasos mínimos para operar -----
  // El negocio ya existe al llegar aquí (gate de onboarding), así que el checklist
  // arranca en los pasos operativos reales.
  readonly steps = computed<CompletionStep[]>(() => [
    { label: 'Registra una sede',   hint: 'Dónde atiendes', done: this.branchCount() > 0,   route: '/tenant/sedes' },
    { label: 'Agrega un servicio',  hint: 'Qué ofreces',    done: this.offeringCount() > 0, route: '/tenant/servicios' },
    { label: 'Suma un empleado',    hint: 'Tu equipo',      done: this.employeeCount() > 0, route: '/tenant/empleados' },
  ]);
  readonly doneCount = computed(() => this.steps().filter(s => s.done).length);
  readonly progressPct = computed(() => Math.round((this.doneCount() / this.steps().length) * 100));
  readonly companyComplete = computed(() => this.doneCount() === this.steps().length);
  readonly firstPending = computed(() => this.steps().find(s => !s.done) ?? null);
  /** El widget de progreso solo aparece mientras falte algo (y ya cargó). */
  readonly showCompletion = computed(() => !this.loading() && !this.companyComplete());

  // Modal de bienvenida: una sola vez, al primer ingreso.
  readonly showWelcome = signal(!!this.auth.user()?.isFirstLogin);

  readonly kpis = computed<Kpi[]>(() => [
    { key: 'sedes', label: 'Sedes', value: this.branchCount(), icon: MapPin, route: '/tenant/sedes' },
    { key: 'empleados', label: 'Empleados', value: this.employeeCount(), icon: Users, route: '/tenant/empleados' },
    { key: 'servicios', label: 'Servicios', value: this.offeringCount(), icon: Scissors, route: '/tenant/servicios' },
  ]);

  private readonly welcomeMascot = viewChild(MascotComponent);
  private welcomed = false;

  constructor() {
    this.load();
    // El orb celebra una vez al abrir el modal de bienvenida.
    effect(() => {
      const cmp = this.welcomeMascot();
      if (this.showWelcome() && cmp && !this.welcomed) {
        this.welcomed = true;
        cmp.celebrate();
      }
    });
  }

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

  /** Cierra el modal de bienvenida y lo marca visto (no reaparece). */
  closeWelcome() { this.showWelcome.set(false); this.auth.markWelcomeSeen(); }

  /** Desde el modal: ir a un paso ahora (marca visto y navega). */
  startStep(route: string) { this.closeWelcome(); this.router.navigateByUrl(route); }

  /** Link estable de descarga del APK (siempre la versión vigente). */
  copyAppLink() {
    navigator.clipboard.writeText(this.appVersionsApi.latestDownloadUrl())
      .then(() => this.toast.success('Link de la app copiado. Compártelo con tu equipo.'));
  }
}
