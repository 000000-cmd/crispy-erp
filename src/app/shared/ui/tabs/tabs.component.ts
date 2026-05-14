import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';

export interface TabItem { id: string; label: string; }

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly active = model<string>('');
}
