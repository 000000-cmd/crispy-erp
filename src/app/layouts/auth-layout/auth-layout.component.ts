import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { BrandingService } from '../../core/branding/branding.service';
import { AuthMascotService } from '../../core/auth/auth-mascot.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { MascotComponent } from '../../shared/ui/mascot/mascot.component';
import { ThemeSwitchComponent } from '../../shared/ui/theme-switch/theme-switch.component';
import { RiveBackgroundComponent } from '../../shared/ui/rive-background/rive-background.component';

/**
 * Layout de autenticación. Panel izquierdo = escenario de la mascota (orb
 * interactivo) con marca discreta; panel derecho = formulario. La mascota
 * reacciona a lo que pasa en los formularios (login/register/admin) a través
 * de `AuthMascotService`: aquí sólo la hospedamos y traducimos sus señales.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MascotComponent, ThemeSwitchComponent, RiveBackgroundComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly branding = inject(BrandingService);
  protected readonly mascot = inject(AuthMascotService);
  private readonly i18n = inject(I18nService);

  /** Nombre de marca (tenant si existe; si no, placeholder de plataforma). */
  protected readonly brandName = computed(() => this.branding.branding()?.name ?? 'ERP Moda');
  /** Iniciales para el wordmark cuando no hay logo. */
  protected readonly brandInitial = computed(() =>
    this.brandName()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase(),
  );
  protected readonly tagline = computed(() => this.i18n.t('auth.tagline'));

  private readonly mascotCmp = viewChild(MascotComponent);
  private lastCelebrate = 0;
  private lastReject = 0;
  private lastJump = 0;

  constructor() {
    // Traduce los pulsos del bus (éxito/error/saludo) a acciones de la mascota.
    effect(() => {
      const cmp = this.mascotCmp();
      const celebrate = this.mascot.celebratePulse();
      const reject = this.mascot.rejectPulse();
      const jump = this.mascot.jumpPulse();
      if (!cmp) return;
      if (celebrate !== this.lastCelebrate) { this.lastCelebrate = celebrate; cmp.celebrate(); }
      if (reject !== this.lastReject) { this.lastReject = reject; cmp.reject(); }
      if (jump !== this.lastJump) { this.lastJump = jump; cmp.jump(); }
    });
  }
}
