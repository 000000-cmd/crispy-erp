import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChartColumn, Package, Calendar, Users, DollarSign, Settings } from 'lucide-angular';

@Component({
  selector: 'sidebar-sys',
  standalone: true,
  templateUrl: './SidebarSys.component.html',
  imports: [LucideAngularModule, CommonModule, RouterModule],
  host:{
    class: 'bg-(--foreground-light) dark:bg-(--foreground-dark)'
  }
})
export class SidebarSysComponent {

  readonly fileIcon = ChartColumn;


  readonly links = [
    { label: 'Estadísticas',  path: '/tenat/estadistica', icon: ChartColumn },
    { label: 'Inventario',    path: '/tenat/inventario',  icon: Package },
    { label: 'Citas',     path: '/tenat/citas',           icon: Calendar },
    { label: 'Empleados', path: '/tenat/empleados',       icon: Users },
    { label: 'Nómina',    path: '/tenat/nomina',          icon: DollarSign},
    { label: 'Configuración', path: '/tenat/config',      icon: Settings },

  ];

}
