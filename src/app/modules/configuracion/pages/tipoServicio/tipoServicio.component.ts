import { Component } from "@angular/core";
import { ContainerComponent } from "../../../../shared/components/ui/container.component";
import { ListItem, SelectCleanComponent } from "../../../../shared/components/forms/selects/select-clean.component";
import { InputCleanComponent } from "../../../../shared/components/forms/inputs/input-clean.component";
import { ItemServiceComponent } from "../../../../shared/components/items/service-item.component";



@Component({
    selector: 'tipo-servicio',
    templateUrl: "./tipoServicio.component.html",
    imports: [ContainerComponent,  InputCleanComponent, ItemServiceComponent],
    standalone: true,
})

export class TipoServicioComponent{
  origenServicioList : ListItem[] = [
    {id: "0",
    code: "",
    name:"Seleccione...",
    order:1  
    },
    {id: "123",
    code: "WhatsApp",
    name:"WhatsApp",
    order:2  
    }
  ]
    

}