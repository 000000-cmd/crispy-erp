import { Component, input } from '@angular/core';
import { LucideAngularModule, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './empty.component.html',
})
export class EmptyComponent {
  readonly icon = input<any>(null);
  readonly title = input<string>('');
  readonly description = input<string>('');
  protected readonly defaultIcon = Inbox;
}
