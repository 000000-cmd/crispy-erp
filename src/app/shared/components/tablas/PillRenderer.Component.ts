import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { PillComponent } from '../ui/pill.component';

@Component({
  selector: 'pill-renderer',
  standalone: true,
  imports: [PillComponent],
  template: `
    <pill
      [label]="value">
    </pill>
  `
})
export class PillRendererComponent implements ICellRendererAngularComp {

  value: any;
  bgClass = '';
  textClass = '';

  agInit(params: any): void {
    this.value = params.value;

    // Aquí defines estilos por estado:
    if (params.value === 'Bajo') {
      this.bgClass = 'bg-red-100';
      this.textClass = 'text-red-600';
    } else if (params.value === 'Normal') {
      this.bgClass = 'bg-green-100';
      this.textClass = 'text-green-600';
    } else {
      this.bgClass = 'bg-gray-100';
      this.textClass = 'text-gray-600';
    }
  }

  refresh(): boolean {
    return false;
  }
}
