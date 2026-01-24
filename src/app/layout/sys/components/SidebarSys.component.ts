import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChartColumn, Package, Calendar, Users, DollarSign, Settings, LucideIconData, User } from 'lucide-angular';

export const SYS_SECTIONS = [
  'estadisticas',
  'estadisticas_general',
  'inventario',
  'citas',
  'empleados',
  'nomina',
  'config',
] as const;
export type SysSection = typeof SYS_SECTIONS[number];
export interface SysLink {
  key: SysSection;
  label: string;
  icon: LucideIconData;
  path?: string;
  childrens?: readonly SysLink[];
}
export const links = [
  { key: 'estadisticas', label: 'Estadísticas', icon: ChartColumn, path:'sys/listas' },
  { key: 'inventario',  label: 'Inventario',    icon: Package,    path: '/sys/inventario/productos', 
    childrens: [{ key: 'estadisticas_general', label: 'Estadísticas Generales', icon: ChartColumn, path: '/sys/estadisticas/general'},
      { key: 'estadisticas_general', label: 'Estadísticas Generales', icon: ChartColumn, path: '/sys/estadisticas/general'},
    ],  
  },
  { key: 'citas',       label: 'Citas',         icon: Calendar,   path: '/sys/citas',},
  { key: 'empleados',   label: 'Empleados',     icon: Users,      path: '/sys/empleados',},
  { key: 'nomina',      label: 'Nómina',        icon: DollarSign, path: '/sys/nomina',},
  { key: 'config',      label: 'Configuración', icon: Settings,   path: '/sys/config',},
]satisfies readonly SysLink[];


@Component({
  selector: 'sidebar-sys',
  standalone: true,
  templateUrl: './SidebarSys.component.html',
  imports: [LucideAngularModule, CommonModule, RouterModule],
  host:{
    class: 'bg-(--foreground-dark) dark:bg-(--foreground-dark)'
  }
})
export class SidebarSysComponent {

  @Input() icon: LucideIconData= User;
  @Output() pathChange = new EventEmitter<string>();
  currentView = signal<SysSection>('estadisticas');
  selected    = signal<SysSection>('estadisticas');
  expanded    = signal<SysSection | null>(null);

  readonly links = links;

  ngOnChanges() {
    console.log('Input selected cambió:', this.selected);
    console.log('Expanded cambio. New expanded,', this.expanded());
    
  } 

  onLinkClick(link: SysLink) {
    // Siempre aplicar efecto visual inmediato
    this.selected.set(link.key);

    // 1️⃣ Si tiene hijos
    if (link.childrens?.length) {
      const isOpen = this.expanded() === link.key;

      if (isOpen) {
        // 🔒 Cerrar
        this.expanded.set(null);
        // 🔁 Volver a la vista real
        this.selected.set(this.currentView());
      } else {
        // 🔓 Abrir
        this.expanded.set(link.key);
      }

      return;
    }

    this.expanded.set(null)

    // 2️⃣ Si NO tiene hijos → navegación normal
    this.currentView.set(link.key);
    if(link.path){
      this.pathChange.emit(link.path)
    }
  }




  onChildClick(parent: SysLink, child: SysLink, event: Event) {
    event.stopPropagation();

    this.currentView.set(child.key);
    this.selected.set(child.key);
    this.expanded.set(parent.key);
  }





  expandedLink = computed<SysLink | null>(() => {
    const key = this.expanded();
    if (!key) return null;

    return this.links.find(link => link.key === key) ?? null;
  });


}