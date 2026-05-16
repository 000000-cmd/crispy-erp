import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Users, Calendar, Wallet, TrendingUp, Download, Plus, ArrowUp, ArrowDown } from 'lucide-angular';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';

interface Stat { label: string; value: string; delta: string; up: boolean; icon: any; }

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, ButtonComponent],
  templateUrl: './dashboard.component.html',
})
export class TenantDashboardComponent {
  private readonly auth = inject(AuthService);
  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? '');

  protected readonly downloadIcon = Download;
  protected readonly plusIcon = Plus;
  protected readonly upIcon = ArrowUp;
  protected readonly downIcon = ArrowDown;

  readonly stats: Stat[] = [
    { label: 'Clientes hoy',    value: '34',     delta: '12.4% vs. semana pasada', up: true,  icon: Users },
    { label: 'Clientes semana', value: '218',    delta: '12.4% vs. semana pasada', up: true,  icon: Calendar },
    { label: 'Ingresos semana', value: '$4,820', delta: '8.1% vs. semana pasada',  up: true,  icon: Wallet },
    { label: 'Ticket promedio', value: '$22.11', delta: '1.2% vs. semana pasada',  up: false, icon: TrendingUp },
  ];

  readonly week = [
    { label: 'Lun', value: 18 }, { label: 'Mar', value: 22 }, { label: 'Mié', value: 28 },
    { label: 'Jue', value: 31 }, { label: 'Vie', value: 42 }, { label: 'Sáb', value: 38 },
    { label: 'Dom', value: 14 },
  ];

  readonly mix = [
    { label: 'Corte clásico', count: 92, pct: 42 },
    { label: 'Corte + barba', count: 61, pct: 28 },
    { label: 'Tinte',         count: 31, pct: 14 },
    { label: 'Tratamiento',   count: 22, pct: 10 },
    { label: 'Otros',         count: 12, pct: 6  },
  ];
}
