import { Component, Input } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { InventarioTableComponent } from './features/inventarioTable.component';
import { CommonModule } from '@angular/common';
import { AlertInlineComponent } from '../../shared/components/alertas/alert-inline.component';
import { ContainerComponent } from "../../shared/components/ui/container.component";


@Component({
  selector: 'inventario',
  standalone: true,
  templateUrl: './inventario.component.html',
  imports: [LucideAngularModule, CommonModule, InventarioTableComponent, AlertInlineComponent, ContainerComponent, ContainerComponent],
})
export class InventarioComponent {

  readonly plusIcon =Plus;

  

}
