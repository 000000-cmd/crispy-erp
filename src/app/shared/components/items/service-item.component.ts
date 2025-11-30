import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContainerComponent } from '../ui/container.component';
import { PillComponent } from '../ui/pill.component';
import { LucideAngularModule, Trash } from 'lucide-angular';

@Component({
  selector: 'item-service',
  standalone: true,
  template: `
    <ui-container >
        <div class="flex  justify-between">
            <div class="flex flex-col ">
                <p class="font-medium text-base">{{ title }}</p>

                <div class="flex gap-2 mt-1">
                <pill [label]="'$' + price" variant="Filled"></pill>
                <pill [label]="time"></pill>
                </div>
            </div>

            <!-- Botón eliminar -->
            <button 
                class="text-red-500 hover:text-red-600"
                (click)="onDelete()"
            >
                <lucide-icon [name]="deleteIcon" />
            </button>
        </div>

    </ui-container>
  `,
  imports: [ContainerComponent, PillComponent, LucideAngularModule],
})
export class ItemServiceComponent {

  readonly deleteIcon = Trash;

  @Input() title: string = 'Corte Clásico';
  @Input() price: number = 20;
  @Input() time: string = '30 min';

  @Output() delete = new EventEmitter<void>();

  onDelete() {
    this.delete.emit();
  }
}
