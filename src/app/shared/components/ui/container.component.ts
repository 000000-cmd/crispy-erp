import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-container',
  template: `
    <div 
    class="p-4 border  border-gray-300 dark:border-gray-700 rounded-lg bg-(--foreground-light) dark:bg-(--foreground-dark) "
    [style.height]="height"
    [style.minWidth]="minWidth"
    >
      @if(label){
        <p class="mb-3">{{label}}</p>
      }
      <ng-content></ng-content>
    </div>
      `,
    host: {
        class: 'flex-1'
    }
})
export class ContainerComponent {

  @Input() height: string = 'auto';
  @Input() minWidth: string = '300px';
  @Input() label?: string 
}
