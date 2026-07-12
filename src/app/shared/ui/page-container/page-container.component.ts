import { Component, computed, input } from '@angular/core';

/**
 * Contenedor de contenido de una pantalla: aplica el ritmo vertical entre
 * secciones y un ancho de lectura opcional. El ancho máximo global y el padding
 * ya los da el layout (admin/tenant); esto centraliza el `space-y` repetido y
 * el ancho "angosto" para pantallas tipo formulario.
 *
 *   <app-page-container>            <!-- ancho completo (listas) -->
 *   <app-page-container width="narrow">  <!-- formularios / lectura -->
 */
@Component({
  selector: 'app-page-container',
  standalone: true,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class PageContainerComponent {
  readonly width = input<'default' | 'narrow'>('default');

  readonly classes = computed(() =>
    this.width() === 'narrow' ? 'space-y-5 max-w-2xl' : 'space-y-5');
}
