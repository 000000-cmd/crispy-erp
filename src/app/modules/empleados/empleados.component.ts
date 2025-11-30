import { Component } from "@angular/core";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { ListItem, SelectCleanComponent } from "../../shared/components/forms/selects/select-clean.component";
import { CardStatComponent } from "../../shared/components/cards/card-stat.component";
import { TablaGridComponent } from "../../shared/components/tablas/tabla.component";


@Component({
    selector:'empleados',
    standalone: true,
    templateUrl: "./empleados.component.html",
    imports: [ContainerComponent, SelectCleanComponent, CardStatComponent, TablaGridComponent],
})

export class EmpleadoComponent{
  ServicioList : ListItem[] = [
    {id: "0",
    code: "",
    name:"Seleccione...",
    order:1  
    },
    {id: "123",
    code: "Corte y Tinte",
    name:"Corte y Tinte",
    order:2  
    },
    {id: "456",
    code: "Corte Clásico",
    name:"Corte Clásico",
    order:2  
    }
  ]

    headers = [
      { label: 'Fecha', key: 'fecha' },
      { label: 'Hora', key: 'hora' },
      { label: 'Cliente', key: 'cliente' },
      { label: 'Servicio', key: 'servicio', type: 'pill'  },
      { label: 'Duración', key: 'duracion'}, // ← esta será una pill
      { label: 'Precio', key: 'precio' }
    ];
    productos = [
    {
        fecha: '29 Oct',
        hora: '09:00',
        cliente: 'Maria Gonzales',
        servicio: 'corte y tinte',
        duracion: '90 min',
        precio: '$45.00',
        acciones: true
    },
    {
        fecha: '29 Oct',
        hora: '11:00',
        cliente: 'Romina Gonzales',
        servicio: 'Tinte',
        duracion: '90 min',
        precio: '$45.00',
        acciones: true
    }
    ];

}