
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pill',
  standalone: true,
  template: `
    <span class="px-3 py-1 rounded-full"
          [class]="currentColor">
      {{ label }}
    </span>
  `,
})
export class PillComponent {
  @Input() label: string = 'Activo';
  @Input() color: 'gray' = 'gray';
  @Input() variant: 'Outline' | 'Filled'  = 'Outline';

  pillColor={
    
    'Outline':{
      'gray':'border dark:border-gray-500 text-gray-400'
    },
    'Filled':{
      'gray':' bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  
  }
  
  get currentColor (){
    return this.pillColor[this.variant][this.color]
  }
}
