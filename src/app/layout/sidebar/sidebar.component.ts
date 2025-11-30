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
    { label: 'Estadísticas',  path: '/estadistica', icon: ChartColumn },
    { label: 'Inventario',    path: '/inventario',  icon: Package },
    { label: 'Citas',     path: '/citas',           icon: Calendar },
    { label: 'Empleados', path: '/empleados',       icon: Users },
    { label: 'Nómina',    path: '/nomina',          icon: DollarSign},
    { label: 'Configuración', path: '/config',      icon: Settings },

  ];

}
