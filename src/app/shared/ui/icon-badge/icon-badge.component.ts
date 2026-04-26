import { Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type IconBadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-icon-badge',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <span [class]="classes()">
      @if (text(); as t) {
        {{ t }}
      } @else {
        <lucide-icon [img]="icon()" [size]="iconSize()"></lucide-icon>
      }
    </span>
  `,
})
export class IconBadgeComponent {
  readonly icon = input<any>(null);
  readonly text = input<string | null>(null);
  readonly tone = input<IconBadgeTone>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly iconSize = computed(() => (this.size() === 'sm' ? 14 : this.size() === 'lg' ? 22 : 16));

  readonly classes = computed(() => {
    const base = 'inline-flex items-center justify-center rounded-md font-semibold';
    const dim = this.size() === 'sm' ? 'h-6 w-6 text-[11px]' : this.size() === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';
    const tone: Record<IconBadgeTone, string> = {
      primary: 'bg-primary-500 text-white',
      neutral: 'bg-surface-muted text-text',
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-500 text-white',
      danger:  'bg-rose-500 text-white',
    };
    return `${base} ${dim} ${tone[this.tone()]}`;
  });
}
