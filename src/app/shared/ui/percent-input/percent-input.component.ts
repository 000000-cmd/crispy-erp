import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, input, model, viewChild } from '@angular/core';

/**
 * Control de porcentaje propio del design system (reemplaza al `<input range>`
 * nativo, visualmente pobre): pista con relleno degradado del tema, thumb
 * grande arrastrable (pointer capture), marcas en 0/25/50/75/100, atajos
 * rápidos y lectura del valor en grande. Accesible: role="slider" + flechas
 * (±1), Shift+flechas (±5), Home/End.
 *
 * Emite por `[(value)]` (model signal). Solo enteros 0–100.
 */
@Component({
  selector: 'app-percent-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-none">
      <!-- lectura grande + atajos -->
      <div class="flex items-end justify-between gap-3 mb-2.5">
        <p class="text-3xl font-bold tracking-tight text-text tabular-nums leading-none">
          {{ value() ?? 0 }}<span class="text-lg font-semibold text-text-muted">%</span>
        </p>
        <div class="flex gap-1">
          @for (p of presets; track p) {
            <button type="button" (click)="set(p)"
                    class="rounded-md px-2 py-1 text-[11px] font-medium transition border"
                    [class.bg-primary-500]="value() === p"
                    [class.text-white]="value() === p"
                    [class.border-primary-500]="value() === p"
                    [class.border-border]="value() !== p"
                    [class.text-text-muted]="value() !== p"
                    [class.hover:bg-surface-muted]="value() !== p">{{ p }}%</button>
          }
        </div>
      </div>

      <!-- pista custom -->
      <div #track
           role="slider"
           tabindex="0"
           aria-label="Porcentaje"
           [attr.aria-valuemin]="0" [attr.aria-valuemax]="100" [attr.aria-valuenow]="value() ?? 0"
           (pointerdown)="onPointerDown($event)"
           (pointermove)="onPointerMove($event)"
           (pointerup)="dragging = false"
           (keydown)="onKey($event)"
           class="relative h-8 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
        <!-- riel -->
        <div class="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-surface-muted border border-border overflow-hidden">
          <!-- relleno degradado -->
          <div class="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transition-[width] duration-100"
               [style.width.%]="value() ?? 0"></div>
        </div>
        <!-- marcas -->
        @for (t of ticks; track t) {
          <span class="absolute top-1/2 h-1.5 w-0.5 -translate-y-1/2 rounded bg-border"
                [style.left.%]="t" aria-hidden="true"></span>
        }
        <!-- thumb -->
        <span class="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface border-2 border-primary-500 shadow-md transition-[left] duration-100 pointer-events-none"
              [style.left.%]="value() ?? 0" aria-hidden="true">
          <span class="absolute inset-1 rounded-full bg-primary-500"></span>
        </span>
      </div>

      <!-- etiquetas de las marcas -->
      <div class="relative mt-1 h-4 text-[10px] text-text-soft" aria-hidden="true">
        @for (t of ticks; track t) {
          <span class="absolute -translate-x-1/2 tabular-nums" [style.left.%]="t">{{ t }}</span>
        }
      </div>
    </div>
  `,
})
export class PercentInputComponent {
  /** Valor 0–100 (null se pinta como 0 hasta que el usuario toque). */
  readonly value = model<number | null>(null);
  readonly disabled = input(false);

  protected readonly ticks = [0, 25, 50, 75, 100];
  protected readonly presets = [10, 25, 50, 75];

  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  protected dragging = false;

  set(v: number) {
    if (this.disabled()) return;
    this.value.set(Math.max(0, Math.min(100, Math.round(v))));
  }

  private valueFromPointer(e: PointerEvent) {
    const r = this.trackRef().nativeElement.getBoundingClientRect();
    this.set(((e.clientX - r.left) / r.width) * 100);
  }

  onPointerDown(e: PointerEvent) {
    if (this.disabled()) return;
    this.dragging = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.trackRef().nativeElement.focus();
    this.valueFromPointer(e);
  }

  onPointerMove(e: PointerEvent) {
    if (this.dragging) this.valueFromPointer(e);
  }

  onKey(e: KeyboardEvent) {
    const step = e.shiftKey ? 5 : 1;
    const v = this.value() ?? 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { this.set(v + step); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { this.set(v - step); e.preventDefault(); }
    else if (e.key === 'Home') { this.set(0); e.preventDefault(); }
    else if (e.key === 'End') { this.set(100); e.preventDefault(); }
  }
}
