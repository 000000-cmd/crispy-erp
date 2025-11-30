import { Component } from "@angular/core";
import {  CitaItem, TablaServiciosComponent } from "./Features/tabla-service.component";
import { ContainerComponent } from "../../shared/components/ui/container.component";


@Component({

    selector: "citas",
    templateUrl: "./citas.component.html",
    standalone: true,
    imports: [TablaServiciosComponent, ContainerComponent],

})

export class CitasComponent {
 citas: CitaItem[] = [
  {
    id: 1,
    hora: "12:00",
    nombreCliente: "Ana Martínez",
    servicioCliente: "Tratamiento Capilar",
    nombreEmpleado: "María Torres",
    origenServicio: "Empleado",
    estadoServicio: "confirmada"
  },
  {
    id: 2,
    hora: "10:30",
    nombreCliente: "Laura Pérez",
    servicioCliente: "Manicure",
    nombreEmpleado: "Ana López",
    origenServicio: "Sistema",
    estadoServicio: "pendiente"
  },
  {
    id: 3,
    hora: "09:00",
    nombreCliente: "María González",
    servicioCliente: "Corte y Tinte",
    nombreEmpleado: "Ana López",
    origenServicio: "WhatsApp",
    estadoServicio: "confirmada"
  },
  {
    id: 4,
    hora: "10:00",
    nombreCliente: "Carlos Ruiz",
    servicioCliente: "Corte Clásico",
    nombreEmpleado: "Pedro Martínez",
    origenServicio: "WhatsApp",
    estadoServicio: "confirmada"
  },
  {
    id: 5,
    hora: "11:00",
    nombreCliente: "José Hernández",
    servicioCliente: "Corte Moderno",
    nombreEmpleado: "Luis García",
    origenServicio: "WhatsApp",
    estadoServicio: "confirmada"
  }
];



}