import { Component, ElementRef, OnDestroy, afterNextRender, input, viewChild } from '@angular/core';
import { Alignment, Fit, Layout, Rive } from '@rive-app/canvas';

/**
 * Fondo animado (Rive) puramente decorativo — carga un `.riv` y lo reproduce en
 * bucle, cubriendo su contenedor (`Fit.Cover`). Sin interacción ni lógica. El
 * canvas es `aria-hidden`. Respeta `prefers-reduced-motion` (queda estático).
 */
@Component({
  selector: 'app-rive-background',
  standalone: true,
  template: `<canvas #cv aria-hidden="true" class="block h-full w-full"></canvas>`,
})
export class RiveBackgroundComponent implements OnDestroy {
  readonly src = input.required<string>();
  /** Nombre de la state machine si el efecto la usa; si no, autoplay de animación. */
  readonly stateMachine = input<string | undefined>(undefined);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private rive?: Rive;
  private resizeObserver?: ResizeObserver;
  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    afterNextRender(() => this.boot());
  }

  private boot(): void {
    const canvas = this.canvasRef().nativeElement;
    const sm = this.stateMachine();
    this.rive = new Rive({
      src: this.src(),
      canvas,
      autoplay: !this.reducedMotion,
      ...(sm ? { stateMachines: sm } : {}),
      layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
      onLoad: () => {
        this.rive?.resizeDrawingSurfaceToCanvas();
        // Diagnóstico: state machines / animaciones disponibles del efecto.
        const c: any = (this.rive as any)?.contents;
        if (c) console.debug('[rive-bg] contents:', JSON.stringify({ artboards: c.artboards?.map((a: any) => a.name) }));
      },
    });
    this.resizeObserver = new ResizeObserver(() => this.rive?.resizeDrawingSurfaceToCanvas());
    this.resizeObserver.observe(canvas);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.rive?.cleanup();
  }
}
