import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, CalendarDays, Users, Scissors, BarChart3, ArrowRight, Check, Star, Sparkles } from 'lucide-angular';
import { BrandingService } from '../../core/branding/branding.service';
import { MascotComponent } from '../../shared/ui/mascot/mascot.component';
import { ThemeSwitchComponent } from '../../shared/ui/theme-switch/theme-switch.component';

interface Feature {
  key: string;
  icon: any;
  title: string;
  blurb: string;
  /** Puntos que se muestran en el preview interactivo al seleccionar. */
  points: string[];
}

/**
 * Landing pública (`/`). Dirección visual "Aurora + glass + ORB": fondo
 * mesh-gradient animado en los OKLCH del tema, tarjetas glass flotantes y el ORB
 * de Rive como héroe. No es un folleto: engancha mostrando el producto en acción
 * (el visitante elige una capacidad y el preview cambia en vivo). Los CTA llevan
 * SOLO a accesos de usuario (login dueño / registro); el acceso de administradores
 * no se expone aquí.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, MascotComponent, ThemeSwitchComponent],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  protected readonly branding = inject(BrandingService);

  protected readonly arrow = ArrowRight;
  protected readonly check = Check;
  protected readonly star = Star;
  protected readonly sparkles = Sparkles;

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

  // Parallax/tilt del ORB (desactivado en reduced-motion / touch).
  readonly tiltX = signal(0);
  readonly tiltY = signal(0);
  private readonly reduce =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  onHeroMove(e: MouseEvent, el: HTMLElement) {
    if (this.reduce) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    this.tiltX.set(Math.round(px * 8));
    this.tiltY.set(Math.round(-py * 8));
  }
  onHeroLeave() { this.tiltX.set(0); this.tiltY.set(0); }
}
