import { Component, computed, input } from '@angular/core';

export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TagSize = 'sm' | 'md';

/**
 * Etiqueta flexible y reutilizable (label/chip). Reemplaza las etiquetas
 * "quemadas" por código repartidas en las vistas.
 *
 * Flexible por diseño:
 *  - `label`: texto (o usar <ng-content> para contenido libre / íconos).
 *  - `tone` : color semántico.
 *  - `size` : sm | md.
 *  - `soft` : variante suave (fondo tenue) u opaca.
 *
 * Ejemplos:
 *   <app-tag [label]="'Activo'" tone="success" />
 *   <app-tag tone="info" size="md"><lucide-icon ... /> Verificado</app-tag>
 */
@Component({
  selector: 'app-tag',
  standalone: true,
  templateUrl: './tag.component.html',
})
export class TagComponent {
  readonly label = input<string>('');
  readonly tone = input<TagTone>('neutral');
  readonly size = input<TagSize>('sm');
  readonly soft = input<boolean>(true);

  readonly classes = computed(() => {
    const size = this.size() === 'md'
      ? 'px-2.5 py-1 text-xs'
      : 'px-2 py-0.5 text-[11px]';
    const base = `inline-flex items-center gap-1 rounded-full font-medium leading-none ${size}`;
    const soft: Record<TagTone, string> = {
      neutral: 'bg-surface-muted text-text-muted',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
      danger:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
      info:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    };
    const solid: Record<TagTone, string> = {
      neutral: 'bg-text-muted text-surface',
      primary: 'bg-primary-500 text-white',
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-500 text-white',
      danger:  'bg-rose-500 text-white',
      info:    'bg-sky-500 text-white',
    };
    return `${base} ${(this.soft() ? soft : solid)[this.tone()]}`;
  });
}
