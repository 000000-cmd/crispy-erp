import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="flex items-center gap-2 bg-gray-300 dark:bg-gray-800  p-1 rounded-full w-fit">
  @for (tab of tabs; track tab) {
  <button
    (click)="selectTab(tab)"
    class="px-4 py-1 rounded-full text-sm transition-all"
    [ngClass]="
      selected === tab
        ? 'bg-gray-100 text-black shadow dark:bg-gray-600 dark:text-white '
        : 'text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-300/20 '
    "
  >
    {{ tab }}
  </button>
  }
</div>

  `,

})
export class TabsComponent {
  @Input() tabs: string[] = [];
  @Input() selected: string = '';
  //bg-gray-800

  /** 
   * 'bg-gray-600 text-white shadow'
        : 'text-gray-300 hover:bg-gray-700/50'
   * 
  */
  @Output() selectedChange = new EventEmitter<string>();

  selectTab(tab: string) {
    this.selected = tab;
    this.selectedChange.emit(tab);
  }
}
