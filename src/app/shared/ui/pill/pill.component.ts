import { Component, computed, input } from '@angular/core';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-pill',
  standalone: true,
  templateUrl: './pill.component.html',
})
export class PillComponent {
  readonly tone = input<PillTone>('neutral');
  readonly soft = input<boolean>(true);

  readonly classes = computed(() => {
    const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none';
    const map: Record<PillTone, string> = this.soft()
      ? {
          neutral: 'bg-surface-muted text-text-muted',
          primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
          success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
          warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
          danger:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
          info:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
        }
      : {
          neutral: 'bg-text-muted text-surface',
          primary: 'bg-primary-500 text-white',
          success: 'bg-emerald-500 text-white',
          warning: 'bg-amber-500 text-white',
          danger:  'bg-rose-500 text-white',
          info:    'bg-sky-500 text-white',
        };
    return `${base} ${map[this.tone()]}`;
  });
}
