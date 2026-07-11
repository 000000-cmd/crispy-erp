import { Component, input } from '@angular/core';

/**
 * Encabezado de página: título + subtítulo + acciones. Reemplaza el bloque
 * `<header><h1>…</h1><p>…</p><button>…</button></header>` repetido inline en ~24
 * pantallas. Las acciones van en el slot por defecto (a la derecha).
 *
 *   <app-page-header title="Sedes" subtitle="Las ubicaciones de tu negocio">
 *     <app-button [icon]="plus">Nueva sede</app-button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-h1 text-text">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-sm text-text-muted mt-0.5">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex items-center gap-2 shrink-0 empty:hidden">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
}
