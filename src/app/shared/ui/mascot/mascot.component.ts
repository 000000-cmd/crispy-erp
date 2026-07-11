import { Component, ElementRef, OnDestroy, afterNextRender, effect, input, viewChild } from '@angular/core';
import {
  Alignment, Fit, Layout, Rive,
  ViewModelInstance, ViewModelInstanceBoolean, ViewModelInstanceTrigger,
} from '@rive-app/canvas';

/**
 * Mascota interactiva (Rive) — renderiza un `.riv` en un `<canvas>` y la controla
 * por **data binding** (ViewModel): expone su estado como inputs (`typing`,
 * `loading`) y acciones imperativas (`celebrate`, `reject`, `jump`) que el host
 * dispara desde eventos de UI que YA ocurren. No contiene lógica de negocio.
 *
 * Este `.riv` no usa inputs clásicos de state machine, sino un ViewModel con
 * propiedades booleanas y triggers. Con `autoBind: true` Rive enlaza la instancia
 * por defecto; aquí resolvemos las propiedades por nombre y degradamos en
 * silencio si alguna no existe (los nombres reales del archivo mandan). El canvas
 * es `aria-hidden` (decorativo) para no interferir con lectores ni con los E2E.
 */
@Component({
  selector: 'app-mascot',
  standalone: true,
  template: `<canvas #cv aria-hidden="true" class="block h-full w-full"></canvas>`,
})
export class MascotComponent implements OnDestroy {
  /** Ruta del `.riv` (servido desde `public/`). */
  readonly src = input('/mascot/ai-orb-mascot.riv');
  /** Nombre de la state machine dentro del artboard. */
  readonly stateMachine = input('State Machine 1');
  /** El usuario está interactuando con un campo (foco/escritura). */
  readonly typing = input(false);
  /** Hay una operación en curso (submit). */
  readonly loading = input(false);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  private rive?: Rive;
  private typingProp: ViewModelInstanceBoolean | null = null;
  private loadingProp: ViewModelInstanceBoolean | null = null;
  private correctProp: ViewModelInstanceTrigger | null = null;
  private wrongProp: ViewModelInstanceTrigger | null = null;
  private jumpProp: ViewModelInstanceTrigger | null = null;

  private ready = false;
  private resizeObserver?: ResizeObserver;
  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    // `afterNextRender` garantiza que el <canvas> ya está en el DOM (y sólo corre
    // en navegador, nunca en prerender/SSR — Rive necesita el canvas real).
    afterNextRender(() => this.boot());

    // Empuja el estado reactivo a las propiedades booleanas del ViewModel.
    effect(() => {
      const typing = this.typing();
      const loading = this.loading();
      if (!this.ready) return;
      if (this.typingProp) this.typingProp.value = typing;
      if (this.loadingProp) this.loadingProp.value = loading;
    });
  }

  private boot(): void {
    const canvas = this.canvasRef().nativeElement;
    this.rive = new Rive({
      src: this.src(),
      canvas,
      autoplay: true,
      autoBind: true, // enlaza la instancia por defecto del ViewModel
      stateMachines: this.stateMachine(),
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        this.rive?.resizeDrawingSurfaceToCanvas();
        this.bindViewModel();
        this.ready = true;
        // Sincroniza el estado inicial una vez enlazado el ViewModel.
        if (this.typingProp) this.typingProp.value = this.typing();
        if (this.loadingProp) this.loadingProp.value = this.loading();
        if (this.reducedMotion) this.rive?.pause();
      },
    });

    this.resizeObserver = new ResizeObserver(() => this.rive?.resizeDrawingSurfaceToCanvas());
    this.resizeObserver.observe(canvas);
  }

  private bindViewModel(): void {
    const vmi = this.rive?.viewModelInstance ?? null;
    if (!vmi) {
      console.warn('[mascot] sin ViewModel enlazado; la mascota no será interactiva.');
      return;
    }
    this.typingProp = this.resolveBool(vmi, 'typingBoolean', 'typing');
    this.loadingProp = this.resolveBool(vmi, 'loadingBoolean', 'loading');
    this.correctProp = this.resolveTrigger(vmi, 'correct');
    this.wrongProp = this.resolveTrigger(vmi, 'wrong');
    this.jumpProp = this.resolveTrigger(vmi, 'jump');
  }

  private resolveBool(vmi: ViewModelInstance, ...names: string[]): ViewModelInstanceBoolean | null {
    for (const n of names) { const p = vmi.boolean(n); if (p) return p; }
    const stem = names[0].toLowerCase().replace('boolean', '');
    const match = vmi.properties.find((p) => p.name.toLowerCase().includes(stem));
    return match ? vmi.boolean(match.name) : null;
  }

  private resolveTrigger(vmi: ViewModelInstance, name: string): ViewModelInstanceTrigger | null {
    const direct = vmi.trigger(name);
    if (direct) return direct;
    const match = vmi.properties.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
    return match ? vmi.trigger(match.name) : null;
  }

  /** Éxito: la mascota celebra. */
  celebrate(): void { if (!this.reducedMotion) this.correctProp?.trigger(); }
  /** Error: la mascota reacciona con desánimo. */
  reject(): void { if (!this.reducedMotion) this.wrongProp?.trigger(); }
  /** Micro-interacción de saludo al acercarse al formulario. */
  jump(): void { if (!this.reducedMotion) this.jumpProp?.trigger(); }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.rive?.cleanup();
  }
}
