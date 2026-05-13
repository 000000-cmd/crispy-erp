import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/auth/auth.service';
import {
  LucideAngularModule,
  Server,
  ShieldCheck,
  Search,
  Database,
  Network,
  Radio,
  Cpu,
  Clock,
  Tag,
} from 'lucide-angular';
import { PanelService } from '../../../core/panel/panel.service';
import { DependencyStatus, ServiceHealth } from '../../../core/panel/panel.api';

interface ServiceCard {
  label: string;
  icon: any;
  health: () => ServiceHealth | undefined;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, LucideAngularModule, DatePipe],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-text tracking-tight">Hola, {{ greeting() }}</h1>
        <p class="text-sm text-text-muted mt-1">Estado de los microservicios en este momento.</p>
      </header>

      <!-- Service cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (svc of services; track svc.label) {
          @let h = svc.health();
          @let info = h?.info;
          @let st = h?.status ?? 'UNKNOWN';
          <app-card>
            <div class="flex items-start gap-3">
              <span
                class="h-11 w-11 rounded-lg inline-flex items-center justify-center shrink-0"
                [class]="iconBg(st)"
              >
                <lucide-icon [img]="svc.icon" [size]="20"></lucide-icon>
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-sm font-semibold text-text truncate">{{ svc.label }}</h3>
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors"
                    [class]="badgeClass(st)"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      [class]="dotClass(st)"
                      [class.animate-pulse]="st === 'UNKNOWN'"
                    ></span>
                    {{ st }}
                  </span>
                </div>

                <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <dt class="text-text-soft inline-flex items-center gap-1">
                    <lucide-icon [img]="tagIcon" [size]="11"></lucide-icon> Versión
                  </dt>
                  <dd class="text-text font-mono truncate" [title]="info?.version || ''">{{ info?.version || '—' }}</dd>

                  <dt class="text-text-soft inline-flex items-center gap-1">
                    <lucide-icon [img]="cpuIcon" [size]="11"></lucide-icon> Entorno
                  </dt>
                  <dd class="text-text">{{ info?.environment || '—' }}</dd>

                  <dt class="text-text-soft inline-flex items-center gap-1">
                    <lucide-icon [img]="clockIcon" [size]="11"></lucide-icon> Uptime
                  </dt>
                  <dd class="text-text">{{ formatUptime(info?.uptimeMillis) }}</dd>

                  @if (info?.buildTime) {
                    <dt class="text-text-soft">Build</dt>
                    <dd class="text-text">{{ info!.buildTime | date:'dd/MM/yy HH:mm' }}</dd>
                  }
                </dl>

                @if (info?.dependencies?.length) {
                  <div class="mt-3 pt-3 border-t border-border">
                    <p class="text-[10px] uppercase tracking-wide text-text-soft mb-2">Dependencias</p>
                    <ul class="flex flex-wrap gap-1.5">
                      @for (d of info!.dependencies!; track d.name) {
                        <li
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border transition-colors"
                          [class]="depClass(d.status)"
                          [title]="d.detail || (d.type + ' · ' + d.status)"
                        >
                          <lucide-icon [img]="depIcon(d.type)" [size]="11"></lucide-icon>
                          <span class="font-medium">{{ d.type }}</span>
                          <span class="text-text-soft">·</span>
                          <span>{{ d.status }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (!info && st === 'DOWN') {
                  <p class="mt-3 text-[11px] text-rose-600 dark:text-rose-400">
                    Sin respuesta del servicio.
                  </p>
                }
              </div>
            </div>
          </app-card>
        }
      </div>

      <!-- Aggregate -->
      <app-card title="Resumen" subtitle="Estado agregado de la plataforma">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-text-muted">Servicios</p>
            <p class="text-xl font-semibold text-text">{{ services.length }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">UP</p>
            <p class="text-xl font-semibold text-emerald-600">{{ counts().up }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">DEGRADED</p>
            <p class="text-xl font-semibold text-amber-600">{{ counts().degraded }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">DOWN</p>
            <p class="text-xl font-semibold text-rose-600">{{ counts().down }}</p>
          </div>
        </div>
      </app-card>
    </div>
  `,
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly panel = inject(PanelService);

  protected readonly tagIcon = Tag;
  protected readonly cpuIcon = Cpu;
  protected readonly clockIcon = Clock;

  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? 'Admin');

  private readonly authHealth   = toSignal(this.panel.authStatus());
  private readonly systemHealth = toSignal(this.panel.systemStatus());
  private readonly searchHealth = toSignal(this.panel.searchStatus());

  readonly services: ServiceCard[] = [
    { label: 'Auth service',   icon: ShieldCheck, health: this.authHealth },
    { label: 'System service', icon: Server,      health: this.systemHealth },
    { label: 'Search service', icon: Search,      health: this.searchHealth },
  ];

  readonly counts = computed(() => {
    const result = { up: 0, down: 0, degraded: 0, unknown: 0 };
    for (const s of this.services) {
      const st = s.health()?.status ?? 'UNKNOWN';
      if (st === 'UP') result.up++;
      else if (st === 'DOWN') result.down++;
      else if (st === 'DEGRADED') result.degraded++;
      else result.unknown++;
    }
    return result;
  });

  formatUptime(ms?: number): string {
    if (!ms || ms <= 0) return '—';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }

  iconBg(st: string): string {
    switch (st) {
      case 'UP':       return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'DEGRADED': return 'bg-amber-50  text-amber-600  dark:bg-amber-900/30  dark:text-amber-300';
      case 'DOWN':     return 'bg-rose-50   text-rose-600   dark:bg-rose-900/30   dark:text-rose-300';
      default:         return 'bg-surface-muted text-text-muted';
    }
  }
  badgeClass(st: string): string {
    switch (st) {
      case 'UP':       return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200';
      case 'DEGRADED': return 'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-200';
      case 'DOWN':     return 'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-200';
      default:         return 'bg-surface-muted text-text-muted';
    }
  }
  dotClass(st: string): string {
    switch (st) {
      case 'UP':       return 'bg-emerald-500';
      case 'DEGRADED': return 'bg-amber-500';
      case 'DOWN':     return 'bg-rose-500';
      default:         return 'bg-text-soft';
    }
  }
  depClass(st: string): string {
    switch (st) {
      case 'UP':   return 'border-emerald-300/60 bg-emerald-50/60 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-200';
      case 'DOWN': return 'border-rose-300/60 bg-rose-50/60 text-rose-700 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-200';
      default:     return 'border-border bg-surface text-text-muted';
    }
  }
  depIcon(type: DependencyStatus['type']): any {
    switch (type) {
      case 'DB':      return Database;
      case 'KAFKA':   return Radio;
      case 'EUREKA':  return Network;
      case 'REDIS':   return Database;
      case 'ELASTIC': return Search;
      default:        return Server;
    }
  }
}
