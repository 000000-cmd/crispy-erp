import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Compass, ArrowLeft, Home } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../button/button.component';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Vista dummy reutilizable para:
 *  - rutas no encontradas (404)
 *  - secciones que aun no estan implementadas
 *  - cualquier estado vacio "no hay nada que mostrar aqui"
 *
 * Modo: por defecto 'not-found'. Usa `[mode]="'coming-soon'"` para texto
 * de "en construccion" o sobreescribe `title`/`description` para mensajes
 * custom.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, ButtonComponent, TPipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = input<'not-found' | 'coming-soon'>('not-found');
  readonly title = input<string>('');
  readonly description = input<string>('');

  protected readonly iconCompass = Compass;
  protected readonly iconBack = ArrowLeft;
  protected readonly iconHome = Home;

  /** Donde manda el boton "Ir al inicio" segun la sesion activa. */
  readonly homeRoute = computed(() => this.auth.isAuthenticated() ? this.auth.homeRoute() : '/login');

  /** Etiquetas resueltas — usa override si vino, si no la del modo. */
  readonly resolvedTitleKey = computed(() =>
    this.title() || (this.mode() === 'coming-soon' ? 'notfound.coming.title' : 'notfound.title'),
  );
  readonly resolvedDescKey = computed(() =>
    this.description() || (this.mode() === 'coming-soon' ? 'notfound.coming.description' : 'notfound.description'),
  );

  goBack() {
    if (history.length > 1) history.back();
    else this.router.navigateByUrl(this.homeRoute());
  }
}
