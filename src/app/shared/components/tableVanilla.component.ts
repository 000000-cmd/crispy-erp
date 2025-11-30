import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tableVanilla-component',
  standalone: true,
  template: `
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="min-w-full text-left text-sm">
        
        <!-- HEADERS DINÁMICOS -->
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th 
              *ngFor="let head of headers" 
              class="px-4 py-2 font-semibold"
            >
              {{ head }}
            </th>
          </tr>
        </thead>

        <!-- BODY DINÁMICO -->
        <tbody>
          <tr 
            *ngFor="let row of data"
            class="border-t hover:bg-gray-50 transition"
          >
            <td 
              *ngFor="let key of keys"
              class="px-4 py-2"
            >
              <!-- Si la celda es un objeto especial (estado) -->
              <ng-container [ngSwitch]="key">

                <!-- Estado -->
                <span *ngSwitchCase="'estado'"
                  class="px-3 py-1 text-xs rounded-full border"
                  [ngClass]="{
                    'bg-green-100 text-green-700 border-green-300': row[key] === 'Normal',
                    'bg-red-100 text-red-700 border-red-300': row[key] === 'Bajo'
                  }"
                >
                  {{ row[key] }}
                </span>

                <!-- Acciones -->
                <button *ngSwitchCase="'acciones'"
                  class="p-1 rounded hover:bg-gray-200 transition"
                >
                  ✏️
                </button>

                <!-- Default: texto normal -->
                <span *ngSwitchDefault>
                  {{ row[key] }}
                </span>

              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  imports: [CommonModule],
})
export class TableVanillaComponent {

  @Input() data: any[] = [];
  @Input() headers: string[] = [];  // nombres visibles
  @Input() keys: string[] = [];     // claves reales del objeto

}
