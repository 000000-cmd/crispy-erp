
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChevronLeft, ChevronRight, Clock, LucideAngularModule, MessageCircle, Search, SearchIcon, User } from 'lucide-angular';
import { InputCleanComponent } from '../../../shared/components/forms/inputs/input-clean.component';
import { AgendaTableComponent } from '../Components/agenda-table.component';
import { ListItem, SelectCleanComponent } from '../../../shared/components/forms/selects/select-clean.component';



export interface CitaItem {
  id: number | string;
  hora?: string; // '12:00'
  nombreCliente: string;
  servicioCliente: string;
  nombreEmpleado?: string;
  origenServicio?: string; // 'WhatsApp' | 'Sistema' | 'Telefono'
  estadoServicio?: string; // 'confirmada' | 'pendiente' | etc
}

@Component({
  selector: 'app-tabla-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule,LucideAngularModule,
    AgendaTableComponent, SelectCleanComponent,
    InputCleanComponent, InputCleanComponent], 
  template: `
  <div class="w-full">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">

      <input-clean
        label="Cliente"
        placeholder="Buscar cliente"
        [(ngModel)]="filters.nombreCliente"
        (ngModelChange)="applyFilters()"

        [iconInput]="search"
        [showStateColors]="showColorsInputs"
      />


      <select-clean
        [options]="ServicioList"
        label="Servicio"
        [(ngModel)]="filters.servicioCliente"
        (ngModelChange)="applyFilters()"

      />
      <input-clean 
        label="Empleado"
        placeholder="Buscar empleado"
        [(ngModel)]="filters.nombreEmpleado"
        (ngModelChange)="applyFilters()"

        [showStateColors]="showColorsInputs"
      />


      <select-clean
        [options]="origenServicioList"
        label="Origen"
        [(ngModel)]="filters.origenServicio"
        (ngModelChange)="applyFilters()"

      />

      <select-clean
        [options]="estadoServicioList"
        label="Estado"
        [(ngModel)]="filters.estadoServicio"
        (ngModelChange)="applyFilters()"
        placeholder="Confirmado, Pendiente ..."

      />


    </div>

    <agenda-table
    [data]="filtered"
    />


  </div>
  `,

})
export class TablaServiciosComponent {

    readonly clockIcon = Clock;
    readonly chevronLeftIcon = ChevronLeft;
    readonly chevronRightIcon = ChevronRight;
    readonly searchIcon = Search;
    readonly userIcon = User;
    readonly messageCircleIcon = MessageCircle;
    readonly search= SearchIcon;

    showColorsInputs = false;

  @Input() data: CitaItem[] = [];
  @Input() pageSize = 5;

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

  estadoServicioList : ListItem[] = [
    {id: "0",
    code: "",
    name:"Seleccione...",
    order:1  
    },
    {id: "123",
    code: "Activo",
    name:"Activo",
    order:2  
    }
  ]
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

  page = 1;
  filters = {
    nombreCliente: '',
    servicioCliente: '',
    nombreEmpleado: '',
    origenServicio: '',
    estadoServicio: ''
  };

  get filtered() {
    const f = this.filters;
    return this.data.filter(d => {
      const match =
        (!f.nombreCliente || d.nombreCliente?.toLowerCase().includes(f.nombreCliente.toLowerCase())) &&
        (!f.servicioCliente || d.servicioCliente?.toLowerCase().includes(f.servicioCliente.toLowerCase())) &&
        (!f.nombreEmpleado || d.nombreEmpleado?.toLowerCase().includes(f.nombreEmpleado.toLowerCase())) &&
        (!f.origenServicio || (d.origenServicio || '').toLowerCase().includes(f.origenServicio.toLowerCase())) &&
        (!f.estadoServicio || (d.estadoServicio || '').toLowerCase().includes(f.estadoServicio.toLowerCase()));
      return match;
    });
  }


  applyFilters() {
    this.page = 1;
  }

}
