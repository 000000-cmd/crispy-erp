import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, Construction } from 'lucide-angular';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [LucideAngularModule, CardComponent],
  templateUrl: './coming-soon.component.html',
})
export class ComingSoonComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly description = input<string>('Estamos trabajando en esta sección. Volverá disponible muy pronto.');
  protected readonly icon = Construction;
}
