import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
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
  imports: [CommonModule, CardComponent, LucideAngularModule, DatePipe, TPipe],
  templateUrl: './dashboard.page.html',
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
