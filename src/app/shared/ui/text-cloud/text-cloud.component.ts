import { Component, OnDestroy, input, signal } from '@angular/core';

/**
 * Nube de texto (speech-bubble) que aparece con animación tras un hover
 * PROLONGADO sobre el contenido proyectado. Reutilizable: envuelve cualquier
 * elemento (un orb, un ícono, un botón) y muestra un mensaje flotante.
 *
 *   <app-text-cloud [text]="'...' " placement="top">
 *     <app-mascot ... />
 *   </app-text-cloud>
 *
 * Aparece tras `delay` ms de hover (o foco) y desaparece al salir. Respeta
 * `prefers-reduced-motion` (definido en la clase `.text-cloud`).
 */
@Component({
  selector: 'app-text-cloud',
  standalone: true,
  template: `
    <span
      class="relative inline-flex"
      (mouseenter)="arm()"
      (mouseleave)="disarm()"
      (focusin)="arm()"
      (focusout)="disarm()"
    >
      <ng-content />
      @if (open()) {
        <span class="text-cloud" [attr.data-placement]="placement()" role="status">{{ text() }}</span>
      }
    </span>
  `,
})
export class TextCloudComponent implements OnDestroy {
  readonly text = input.required<string>();
  /** Hover prolongado: ms antes de aparecer. */
  readonly delay = input(450);
  readonly placement = input<'top' | 'bottom' | 'left' | 'right'>('top');

  readonly open = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  arm(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.open.set(true), this.delay());
  }

  disarm(): void {
    clearTimeout(this.timer);
    this.open.set(false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
