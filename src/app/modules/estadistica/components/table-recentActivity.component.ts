import { Component, NgModule } from "@angular/core";

import { TablaListComponent } from "../../../shared/components/tablas/tabla-lista.component";


@Component({
    selector: "table-recent-activity",
    template: `
        <p>Tabla de Actividad Reciente - en construcción</p>

    <tabla-list
    [headers]="headers"
    [rowData]="rowData"
    [height]="'400px'"
    ></tabla-list>
    `,
    imports: [TablaListComponent]
})
export class TableRecentActivityComponent {


        headers = [
      { label: 'Hora', key: 'hora' },
      { label: 'Fecha', key: 'fecha' },
        { label: 'Nombre', key: 'nombre' }
    ];

    rowData: any[] = [{
        hora: '10:15 AM',
        fecha: '2024-06-15 10:23 AM',
        nombre: 'Juan Pérez'
    }, {
        hora: '11l:45 AM',
        fecha: '2024-06-15 11:45 AM',
        nombre: 'María Gómez'
    }, {
        hora: '12:30 PM',
        fecha: '2024-06-15 01:15 PM',
        nombre: 'Carlos López'

    }];


}