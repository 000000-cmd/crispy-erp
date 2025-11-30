import { Component } from "@angular/core";
import { ContainerComponent } from "../../../../shared/components/ui/container.component";
import { InputCleanComponent } from "../../../../shared/components/forms/inputs/input-clean.component";
import { LucideAngularModule, Plus } from "lucide-angular";
import { ItemPercentageComponent } from "../../../../shared/components/items/percentage-item.component";


@Component({
    selector: 'comisiones',
    standalone: true,
    templateUrl: './comisiones.component.html',
    imports: [ContainerComponent, InputCleanComponent, LucideAngularModule, ItemPercentageComponent]
})

export class ComisionesComponent{

      readonly plusIcon =Plus;


}