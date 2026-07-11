import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'line' | 'block' | 'circle';

/**
 * Placeholder de carga (shimmer). Sustituye los "Cargando…" en texto por una
 * silueta del contenido que va a llegar — reduce la sensación de espera y evita
 * saltos de layout.
 *
 *   <app-skeleton variant="line" [lines]="3" />
 *   <app-skeleton variant="circle" width="2.25rem" />
 *   <app-skeleton variant="block" height="8rem" />
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
})
export class SkeletonComponent {
  readonly variant = input<SkeletonVariant>('line');
  readonly width = input<string>('');
  readonly height = input<string>('');
  /** Nº de líneas (solo variant='line'); la última sale más corta. */
  readonly lines = input<number>(1);

  readonly shapeClass = computed(() => ({
    line: 'rounded',
    block: 'rounded-xl',
    circle: 'rounded-full',
  }[this.variant()]));

  readonly rows = computed(() => Array.from({ length: Math.max(1, this.lines()) }));

  readonly resolvedHeight = computed(() =>
    this.height() || (this.variant() === 'line' ? '0.8rem' : this.variant() === 'circle' ? '2.25rem' : '5rem'));

  /** En circle, ancho = alto (cuadrado). */
  resolvedWidth(index: number, isLast: boolean): string {
    if (this.variant() === 'circle') return this.width() || this.resolvedHeight();
    if (this.variant() === 'line' && isLast && this.lines() > 1) return '68%';
    return this.width() || '100%';
  }
}
