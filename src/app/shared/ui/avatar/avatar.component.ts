import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarTone = 'primary' | 'sky' | 'emerald' | 'amber' | 'violet' | 'rose';

const TONE_ORDER: AvatarTone[] = ['primary', 'sky', 'emerald', 'amber', 'violet', 'rose'];

const TONES: Record<AvatarTone, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
  sky:     'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  violet:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
  rose:    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
};

const SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-caption',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-12 w-12 text-base',
};

/**
 * Avatar del design system: iniciales (con color derivado del nombre) o imagen.
 * Reemplaza los círculos de iniciales "quemados" en sidebar, topbar, auth y
 * dashboard. El color estable-por-nombre ayuda a distinguir personas de un
 * vistazo sin pedir foto.
 *
 *   <app-avatar [name]="user.fullName" size="md" />
 *   <app-avatar [name]="business.name" [src]="business.logoUrl" tone="primary" />
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  readonly name = input<string>('');
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  /** Fuerza el tono en vez de derivarlo del nombre (ej. la marca). */
  readonly tone = input<AvatarTone | null>(null);

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  });

  readonly sizeClasses = computed(() => SIZES[this.size()]);

  readonly toneClasses = computed(() => {
    const forced = this.tone();
    if (forced) return TONES[forced];
    const n = this.name();
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return TONES[TONE_ORDER[h % TONE_ORDER.length]];
  });
}
