import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAngularModule, CalendarDays, Wallet, Users, TrendingUp, ArrowUp, ArrowDown,
  CalendarPlus, UserPlus, Receipt, ChevronRight, AlertTriangle, Check, X, Clock,
} from 'lucide-angular';

import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';

type Tab = 'overview' | 'agenda' | 'analitica';
interface Kpi { key: string; label: string; value: string; delta: string; up: boolean; icon: any; }
interface DayLoad { label: string; count: number; load: number; } // load 0..1
interface Appt { time: string; name: string; service: string; staff: string; status: 'completed' | 'inProgress' | 'pending'; }

/**
 * Panel del dueño. Estilo aprobado: cálido, limpio, con la operación del día de
 * un vistazo (KPIs, ocupación, próximo turno, acciones, alertas) sin saturar.
 * Reutiliza el shell/sidebar (config por rol) y los componentes del sistema.
 *
 * Las métricas operativas (citas, ingresos, ocupación, inventario) usan datos de
 * muestra mientras el back de agendamiento/inventario no exista; el nombre del
 * negocio sí se resuelve real vía /business/mine.
 */
@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, ButtonComponent, TagComponent],
  templateUrl: './dashboard.component.html',
})
export class TenantDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly businessApi = inject(BusinessApi);
  private readonly router = inject(Router);

  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? '');
  readonly businessName = signal<string>('Mi estudio');

  readonly tab = signal<Tab>('overview');
  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Resumen' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'analitica', label: 'Analítica' },
  ];

  readonly activeKpi = signal<string>('agendas');

  // Icons
  protected readonly upIcon = ArrowUp;
  protected readonly downIcon = ArrowDown;
  protected readonly chevron = ChevronRight;
  protected readonly alertIcon = AlertTriangle;
  protected readonly checkIcon = Check;
  protected readonly xIcon = X;
  protected readonly clockIcon = Clock;

  readonly kpis: Kpi[] = [
    { key: 'agendas',  label: 'Agendas hoy',   value: '34',     delta: '12.4% vs. semana pasada', up: true,  icon: CalendarDays },
    { key: 'ingresos', label: 'Ingresos hoy',  value: '$612',   delta: '8.0% vs. semana pasada',  up: true,  icon: Wallet },
    { key: 'clientes', label: 'Clientes hoy',  value: '28',     delta: '4.5% vs. semana pasada',  up: true,  icon: Users },
    { key: 'ticket',   label: 'Ticket prom.',  value: '$21.8',  delta: '1.2% vs. semana pasada',  up: false, icon: TrendingUp },
  ];

  // Ocupación de hoy
  readonly ocupacion = 71;
  readonly completadas = 5;
  readonly restantes = 2;
  readonly legend = [
    { label: 'Completada', count: 5, tone: 'bg-primary-500' },
    { label: 'Confirmada', count: 1, tone: 'bg-emerald-500' },
    { label: 'Pendiente',  count: 1, tone: 'bg-amber-400' },
  ];
  readonly week: DayLoad[] = [
    { label: 'Lun', count: 2, load: 0.25 }, { label: 'Mar', count: 2, load: 0.30 },
    { label: 'Mié', count: 2, load: 0.35 }, { label: 'Jue', count: 2, load: 0.40 },
    { label: 'Vie', count: 2, load: 0.45 }, { label: 'Sáb', count: 3, load: 0.70 },
    { label: 'Dom', count: 4, load: 0.95 },
  ];

  // Próximo turno
  readonly nextTurn = {
    initials: 'DB', name: 'D. Benítez', service: 'Corte + barba', price: '$25', time: '08:45', inMin: 'En 5 min',
  };

  // Acciones rápidas
  readonly actions = [
    { key: 'cita',    label: 'Nueva cita',     sub: 'Agendar turno',    icon: CalendarPlus, route: '/tenant/dashboard' },
    { key: 'cliente', label: 'Nuevo cliente',  sub: 'Agregar ficha',    icon: UserPlus,     route: '/tenant/dashboard' },
    { key: 'venta',   label: 'Registrar venta',sub: 'Productos o extra', icon: Receipt,      route: '/tenant/dashboard' },
  ];

  // Agenda de hoy (timeline)
  readonly unassigned = { service: 'Corte + Lavado', detail: '10:00 AM · Cliente nuevo' };
  readonly agenda: Appt[] = [
    { time: '08:00', name: 'M. Sánchez', service: 'Corte clásico · 45min', staff: 'Diego B.', status: 'completed' },
    { time: '08:45', name: 'D. Benítez', service: 'Corte + barba · 1h',     staff: 'Carlos M.', status: 'inProgress' },
    { time: '10:00', name: 'A. Rossi',   service: 'Coloración · 2h',        staff: 'Ana P.',   status: 'pending' },
  ];

  constructor() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.businessApi.mine(userId).subscribe({
        next: list => { if (list[0]?.name) this.businessName.set(list[0].name); },
      });
    }
  }

  statusTag(s: Appt['status']) {
    switch (s) {
      case 'completed':  return { label: 'Completada', tone: 'neutral' as const };
      case 'inProgress': return { label: 'En curso',   tone: 'primary' as const };
      default:           return { label: 'Pendiente',  tone: 'warning' as const };
    }
  }

  go(route: string) { this.router.navigateByUrl(route); }
}
