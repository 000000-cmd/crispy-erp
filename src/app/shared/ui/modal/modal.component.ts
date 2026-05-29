import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';

/** Debe coincidir con la duracion de salida en el CSS (.app-modal.is-closing). */
const EXIT_MS = 200;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly onClose = output<void>();

  /**
   * Mantenemos el modal en el DOM mientras se reproduce la animacion de
   * cierre. `rendered` controla el @if; `closing` aplica la clase de salida.
   * Sin esto, `@if (open())` desmontaria el nodo al instante y no habria
   * transicion de repliegue.
   */
  protected readonly rendered = signal(false);
  protected readonly closing = signal(false);
  private exitTimer: any = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      // untracked: solo dependemos de open(); leer/escribir rendered dentro
      // del mismo effect sin untracked es un anti-patron que puede recursar.
      const wasRendered = untracked(() => this.rendered());
      if (isOpen) {
        if (this.exitTimer) { clearTimeout(this.exitTimer); this.exitTimer = null; }
        this.closing.set(false);
        this.rendered.set(true);
      } else if (wasRendered) {
        this.closing.set(true);
        if (this.exitTimer) clearTimeout(this.exitTimer);
        this.exitTimer = setTimeout(() => {
          this.rendered.set(false);
          this.closing.set(false);
          this.exitTimer = null;
        }, EXIT_MS);
      }
    });
  }

  readonly sizeClass = computed(() => ({
    sm: 'w-full max-w-md',
    md: 'w-full max-w-xl',
    lg: 'w-full max-w-3xl',
    xl: 'w-full max-w-5xl',
  }[this.size()]));
}
