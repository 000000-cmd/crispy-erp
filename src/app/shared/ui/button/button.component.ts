import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<any>(null);
  readonly block = input<boolean>(false);

  readonly onClick = output<MouseEvent>();

  readonly iconSize = computed(() => (this.size() === 'sm' ? 14 : this.size() === 'lg' ? 18 : 16));

  readonly classes = computed(() => {
    const base = 'app-btn inline-flex items-center justify-center gap-2 rounded-md font-medium cursor-pointer select-none active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface';
    const size = this.size() === 'sm' ? 'h-8 px-3 text-xs' : this.size() === 'lg' ? 'h-11 px-5 text-sm' : 'h-9 px-4 text-sm';
    const variant = {
      primary:  'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow active:bg-primary-700',
      secondary:'bg-surface border border-border text-text hover:bg-surface-hover hover:border-border-strong',
      ghost:    'text-text hover:bg-surface-hover',
      danger:   'bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow active:bg-rose-800',
      subtle:   'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50',
    }[this.variant()];
    const w = this.block() ? 'w-full' : '';
    return `${base} ${size} ${variant} ${w}`;
  });
}
