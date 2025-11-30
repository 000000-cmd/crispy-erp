import { Component } from '@angular/core';
import { TableVanillaComponent } from '../../../shared/components/tableVanilla.component';
import { TablaGridComponent } from '../../../shared/components/tablas/tabla.component';



@Component({
  selector: 'tabla-inventario',
  standalone: true,
  template: `
    <tabla-grid
      [rowData]="productos"
      [headers]="headers"
      height="500px"
    ></tabla-grid>
  `,
  imports: [ TablaGridComponent],
})

export class InventarioTableComponent {


    //TODO: FETCH DATA FROM API

    headers = [
      { label: 'Producto', key: 'producto' },
      { label: 'Categoría', key: 'categoria' },
      { label: 'Cantidad', key: 'cantidad' },
      { label: 'Estado', key: 'estado', type: 'pill' }, // ← esta será una pill
      { label: 'Acciones', key: 'acciones' }
    ];
    productos = [
    {
        producto: 'Shampoo Profesional',
        categoria: 'Cuidado Capilar',
        cantidad: '25 unidades',
        minimo: 10,
        precio: '$15.00',
        estado: 'Normal',
        acciones: true
    },
    {
        producto: 'Toallas Desechables',
        categoria: 'Consumibles',
        cantidad: '8 paquetes',
        minimo: 15,
        precio: '$8.00',
        estado: 'Bajo',
        acciones: true
    }
    ];



}
