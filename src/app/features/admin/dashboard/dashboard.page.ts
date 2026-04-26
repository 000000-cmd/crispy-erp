import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Users, ListTree, Hash, Shield } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-text tracking-tight">Hola, {{ greeting() }}</h1>
        <p class="text-sm text-text-muted mt-1">Panel administrativo del sistema.</p>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (s of stats; track s.label) {
          <app-card>
            <div class="flex items-center gap-3">
              <span class="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 inline-flex items-center justify-center">
                <lucide-icon [img]="s.icon" [size]="18"></lucide-icon>
              </span>
              <div>
                <p class="text-xs text-text-muted">{{ s.label }}</p>
                <p class="text-2xl font-semibold text-text tracking-tight">{{ s.value }}</p>
              </div>
            </div>
          </app-card>
        }
      </div>

      <app-card title="Estado del sistema" subtitle="Resumen rápido">
        <p class="text-sm text-text-muted">Conecta los widgets reales aquí cuando los endpoints estén listos.</p>
      </app-card>
    </div>
  `,
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);
  readonly greeting = computed(() => this.auth.user()?.fullName?.split(' ')[0] ?? 'Admin');

  readonly stats = [
    { label: 'Usuarios', value: '–', icon: Users },
    { label: 'Listas',   value: '–', icon: ListTree },
    { label: 'Constantes', value: '–', icon: Hash },
    { label: 'Roles',    value: '–', icon: Shield },
  ];
}
