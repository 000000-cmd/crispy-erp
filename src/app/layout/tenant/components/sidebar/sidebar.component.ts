import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChartColumn, Package, Calendar, Users, DollarSign, Settings } from 'lucide-angular';

@Component({
  selector: 'sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [LucideAngularModule, CommonModule, RouterModule],
  host:{
    class: 'bg-(--foreground-light) dark:bg-(--foreground-dark)'
  }
})
export class SidebarComponent {

  readonly fileIcon = ChartColumn;


  readonly links = [
    { label: 'Estadísticas',  path: '/tenant/estadistica', icon: ChartColumn },
    { label: 'Inventario',    path: '/tenant/inventario',  icon: Package },
    { label: 'Citas',         path: '/tenant/citas',           icon: Calendar },
    { label: 'Empleados',     path: '/tenant/empleados',       icon: Users },
    { label: 'Nómina',        path: '/tenant/nomina',          icon: DollarSign},
    { label: 'Configuración', path: '/tenant/config',      icon: Settings },

  ];

}
