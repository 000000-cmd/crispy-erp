import { animate, style, transition, trigger } from '@angular/animations';

/**
 * Despliegue/repliegue suave para acordeones y secciones colapsables.
 *
 * Anima altura + opacidad en ambos sentidos (a diferencia de un `@if` pelado,
 * que al cerrar desaparece de golpe). Curvas:
 *   - abrir:  ease-out tipo iOS (entra rápido, asienta suave).
 *   - cerrar: un poco más rápido (el sistema responde, no delibera).
 *
 * Uso:
 *   @Component({ animations: [collapse] })
 *   <div @collapse> ...contenido... </div>   (dentro de un @if / *ngIf)
 */
export const collapse = trigger('collapse', [
  transition(':enter', [
    style({ height: '0', opacity: 0, overflow: 'hidden' }),
    animate('260ms cubic-bezier(0.32, 0.72, 0, 1)',
      style({ height: '*', opacity: 1 })),
  ]),
  transition(':leave', [
    style({ overflow: 'hidden' }),
    animate('200ms cubic-bezier(0.4, 0, 1, 1)',
      style({ height: '0', opacity: 0 })),
  ]),
]);
