import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, Construction } from 'lucide-angular';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [LucideAngularModule, CardComponent],
  template: `
    <div class="space-y-5">
      <header>
        <h1 class="text-xl font-semibold text-text tracking-tight">{{ title() }}</h1>
        <p class="text-sm text-text-muted mt-0.5">{{ subtitle() }}</p>
      </header>

      <app-card>
        <div class="flex flex-col items-center text-center py-12">
          <span class="h-14 w-14 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 inline-flex items-center justify-center mb-4">
            <lucide-icon [img]="icon" [size]="26"></lucide-icon>
          </span>
          <h3 class="text-base font-semibold text-text">Próximamente</h3>
          <p class="text-sm text-text-muted mt-1 max-w-md">
            {{ description() }}
          </p>
        </div>
      </app-card>
    </div>
  `,
})
export class ComingSoonComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly description = input<string>('Estamos trabajando en esta sección. Volverá disponible muy pronto.');
  protected readonly icon = Construction;
}
