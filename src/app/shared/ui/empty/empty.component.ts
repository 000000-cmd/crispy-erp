import { Component, input } from '@angular/core';
import { LucideAngularModule, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-10 text-text-muted">
      <lucide-icon [img]="icon() || defaultIcon" [size]="32" class="opacity-60 mb-2"></lucide-icon>
      <p class="text-sm font-medium text-text">{{ title() || 'Sin resultados' }}</p>
      @if (description()) { <p class="text-xs mt-1 max-w-sm">{{ description() }}</p> }
    </div>
  `,
})
export class EmptyComponent {
  readonly icon = input<any>(null);
  readonly title = input<string>('');
  readonly description = input<string>('');
  protected readonly defaultIcon = Inbox;
}
