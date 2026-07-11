import { Component, ElementRef, OnDestroy, afterNextRender, effect, inject, input, viewChild } from '@angular/core';
import { Alignment, Fit, Layout, Rive, StateMachineInput } from '@rive-app/canvas';
import { ThemeService } from '../../../core/theme/theme.service';

/**
 * Switch día/noche animado (Rive) que controla el modo del tema. Es un `<button>`
 * real (accesible y clickeable) con el `.riv` como cara visual. La state machine
 * refleja el modo actual (booleano `Day/Night`) y reproduce la transición al
 * cambiar; el trigger `ButtonClick` da el feedback de pulsación.
 *
 * Mantiene un `.app-knob` oculto dentro del botón: el E2E de dark-mode localiza
 * el toggle con `button:has(.app-knob)`, así que ese contrato se preserva.
 */
@Component({
  selector: 'app-theme-switch',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="toggle()"
      [attr.aria-label]="theme.mode() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
      [attr.aria-pressed]="theme.mode() === 'dark'"
      class="relative block cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
    >
      <canvas #cv aria-hidden="true" class="block h-full w-full"></canvas>
      <span class="app-knob sr-only">tema</span>
    </button>
  `,
})
export class ThemeSwitchComponent implements OnDestroy {
  protected readonly theme = inject(ThemeService);

  readonly src = input('/mascot/theme-switch.riv');
  readonly stateMachine = input('State Machine 1');

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private rive?: Rive;
  private toggleInput?: StateMachineInput; // booleano Day/Night
  private clickInput?: StateMachineInput;  // trigger ButtonClick
  private ready = false;
  private resizeObserver?: ResizeObserver;
  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    afterNextRender(() => this.boot());
    effect(() => {
      const dark = this.theme.mode() === 'dark';
      if (this.ready && this.toggleInput) this.toggleInput.value = dark;
    });
  }

  private boot(): void {
    const canvas = this.canvasRef().nativeElement;
    this.rive = new Rive({
      src: this.src(),
      canvas,
      autoplay: true,
      stateMachines: this.stateMachine(),
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        this.rive?.resizeDrawingSurfaceToCanvas();
        const inputs = this.rive?.stateMachineInputs(this.stateMachine()) ?? [];
        this.toggleInput = inputs.find((i) => /day|night|switch|dark|toggle/i.test(i.name));
        this.clickInput = inputs.find((i) => /click|press|tap|button/i.test(i.name));
        this.ready = true;
        if (this.toggleInput) this.toggleInput.value = this.theme.mode() === 'dark';
      },
    });
    this.resizeObserver = new ResizeObserver(() => this.rive?.resizeDrawingSurfaceToCanvas());
    this.resizeObserver.observe(canvas);
  }

  toggle(): void {
    this.theme.toggleMode();
    if (!this.reducedMotion) this.clickInput?.fire();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.rive?.cleanup();
  }
}
