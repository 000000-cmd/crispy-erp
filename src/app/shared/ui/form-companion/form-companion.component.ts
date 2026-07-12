import { Component, input } from '@angular/core';
import { MascotComponent } from '../mascot/mascot.component';
import { TextCloudComponent } from '../text-cloud/text-cloud.component';

/**
 * Acompañante de formulario: el orb (grande) + un mensaje contextual. Guía al
 * usuario la PRIMERA vez que usa uno de los formularios principales del negocio
 * (onboarding, sede, servicio, empleado) y en la bienvenida. Deliberadamente
 * acotado a esos casos para que el orb no resulte opresivo en toda la app.
 *
 * Si se pasa `tip`, al hacer hover prolongado sobre el orb aparece una nube de
 * texto con esa ayuda extra.
 */
@Component({
  selector: 'app-form-companion',
  standalone: true,
  imports: [MascotComponent, TextCloudComponent],
  template: `
    <div class="flex items-center gap-4 rounded-xl border border-border bg-surface-muted/60 p-4 sm:gap-5 sm:p-5">
      @if (tip()) {
        <app-text-cloud [text]="tip()" placement="top" class="shrink-0">
          <app-mascot class="block h-40 w-40 sm:h-56 sm:w-56" [typing]="typing()" />
        </app-text-cloud>
      } @else {
        <app-mascot class="block h-40 w-40 shrink-0 sm:h-56 sm:w-56" [typing]="typing()" />
      }
      <div class="min-w-0">
        @if (title()) { <p class="text-h3 text-text">{{ title() }}</p> }
        <p class="text-sm text-text-muted">{{ message() }}</p>
      </div>
    </div>
  `,
})
export class FormCompanionComponent {
  readonly title = input('');
  readonly message = input.required<string>();
  /** Reacciona al foco/escritura del formulario si el consumidor lo cablea. */
  readonly typing = input(false);
  /** Ayuda extra que aparece en una nube al hacer hover prolongado sobre el orb. */
  readonly tip = input('');
}
