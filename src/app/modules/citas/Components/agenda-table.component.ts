import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AgendaRowComponent, OrigenServicio } from "./agenda-row.component";
import { ChevronLeft, ChevronRight, LucideAngularModule } from "lucide-angular";

export interface CitaItem {
    id: number | string;
    hora?: string; // '12:00'
    nombreCliente: string;
    servicioCliente: string;
    nombreEmpleado?: string;
    origenServicio?: OrigenServicio; // 'WhatsApp' | 'Sistema' | 'Telefono'
    estadoServicio?: string; // 'confirmada' | 'pendiente' | etc
}

@Component({
    selector: 'agenda-table',
    standalone: true,
    imports: [CommonModule, AgendaRowComponent, LucideAngularModule],
    template: `

    <div class="flex flex-col space-y-4">
      @for (item of pageItems; track item.id) {
        <agenda-row
          [hora]="item.hora"
          [nombreCliente]="item.nombreCliente"
          [servicioCliente]="item.servicioCliente"
          [nombreEmpleado]="item.nombreEmpleado"
          [origenServicio]="item.origenServicio"
        />
      }
    </div>
    <!-- paginación -->
    <div class="flex items-center justify-center gap-4 mt-6">
    <button (click)="prevPage()" [disabled]="page === 1" class="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40">
        <lucide-angular [name]="chevronLeftIcon" class="w-5 h-5"/>
    </button>

    <div class="text-sm text-gray-600">Página {{page}} de {{totalPages}}</div>

    <button (click)="nextPage()" [disabled]="page === totalPages" class="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40">
        <lucide-angular [name]="chevronRightIcon" class="w-5 h-5"/>
    </button>
    </div>

    `

})

export class AgendaTableComponent {
    readonly chevronLeftIcon = ChevronLeft;
    readonly chevronRightIcon = ChevronRight;

    @Input() pageSize = 5;
    @Input() data: any
    page = 1;

    get totalPages() {
        return Math.max(1, Math.ceil(this.data.length / this.pageSize));
    }
    get pageItems() {
        const start = (this.page - 1) * this.pageSize;
        return this.data.slice(start, start + this.pageSize);
    }

        
    prevPage() { this.page = Math.max(1, this.page - 1); }
    nextPage() { this.page = Math.min(this.totalPages, this.page + 1); }

}

