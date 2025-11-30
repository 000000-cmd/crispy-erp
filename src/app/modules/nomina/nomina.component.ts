import { Component } from "@angular/core";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { SelectCleanComponent } from "../../shared/components/forms/selects/select-clean.component";
import { CardStatComponent } from "../../shared/components/cards/card-stat.component";
import { TablaGridComponent } from "../../shared/components/tablas/tabla.component";
import { PillComponent } from "../../shared/components/ui/pill.component";


@Component({
    selector:'nomina',
    templateUrl:'./nomina.component.html',
    standalone: true,
    imports: [ContainerComponent, CardStatComponent, TablaGridComponent, PillComponent],
})
export class NominaComponent {

    headers = [
        { label: 'Empleado',        key: 'empleado' },
        { label: 'Rol',             key: 'rol', type: 'pill'},
        { label: 'Servicios',       key: 'servicios' },
        { label: 'Ingresos Brutos', key: 'ingresosBrutos' },
        { label: 'Tasa Comisión',   key: 'tasaComision'  },
        { label: 'Comisión',        key: 'comisión'}, 
        { label: 'Deducciones',     key: 'deducciones' },
        { label: 'Pago Neto',       key: 'pagoNeto' }
    ];
    nomina = [
    {
        empleado: 'Ana López',
        rol: 'Estilista Senior',
        servicios: '15',
        ingresosBrutos: '$180.00',
        tasaComision: '60%',
        comisión: '$108.00',
        deducciones: '-$10.80',
        pagoNeto: '$97.20',
        acciones: true
    },
    {
        empleado: 'Ana López',
        rol: 'Estilista Senior',
        servicios: '15',
        ingresosBrutos: '$180.00',
        tasaComision: '60%',
        comisión: '$108.00',
        deducciones: '-$10.80',
        pagoNeto: '$97.20',
        acciones: true
    }
    ];
}