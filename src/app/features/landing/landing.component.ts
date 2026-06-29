import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, CalendarDays, Users, Scissors, BarChart3, Moon, Sun, ArrowRight, Check, Star } from 'lucide-angular';
import { ThemeService } from '../../core/theme/theme.service';
import { BrandingService } from '../../core/branding/branding.service';

interface Feature {
  key: string;
  icon: any;
  title: string;
  blurb: string;
  /** Puntos que se muestran en el preview interactivo al seleccionar. */
  points: string[];
}

/**
 * Landing pública (`/`). No es un folleto de venta: engancha mostrando el
 * producto en acción. El visitante elige una capacidad y el preview cambia en
 * vivo (enganche funcional). Los CTA llevan SOLO a accesos de usuario
 * (login dueño / registro); el acceso de administradores no se expone aquí.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly branding = inject(BrandingService);

  protected readonly moonIcon = Moon;
  protected readonly sunIcon = Sun;
  protected readonly arrow = ArrowRight;
  protected readonly check = Check;
  protected readonly star = Star;

  readonly features: Feature[] = [
    {
      key: 'agenda', icon: CalendarDays, title: 'Agenda en tiempo real',
      blurb: 'Reservas y citas sin choques, con recordatorios automáticos.',
      points: ['Vista por profesional y por sede', 'Bloqueos y descansos', 'Recordatorios por WhatsApp/correo'],
    },
    {
      key: 'equipo', icon: Users, title: 'Tu equipo, organizado',
      blurb: 'Turnos, comisiones y desempeño de cada colaborador.',
      points: ['Turnos completos o parciales', 'Comisiones por servicio', 'Rendimiento por persona'],
    },
    {
      key: 'servicios', icon: Scissors, title: 'Servicios a tu medida',
      blurb: 'Catálogo por empresa, ajustable en cada sede.',
      points: ['Precios y duración por servicio', 'Override por sede', 'Categorías y combos'],
    },
    {
      key: 'metricas', icon: BarChart3, title: 'Métricas que deciden',
      blurb: 'Ingresos, ocupación y recurrencia en un vistazo.',
      points: ['Ingresos por sede y periodo', 'Ocupación de la agenda', 'Clientes recurrentes'],
    },
  ];

  readonly activeKey = signal(this.features[0].key);
  readonly active = computed(() => this.features.find(f => f.key === this.activeKey()) ?? this.features[0]);

  readonly brandName = computed(() => this.branding.branding()?.name ?? 'ERP Moda');
}
