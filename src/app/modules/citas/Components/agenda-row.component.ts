import { Component, Input } from "@angular/core";
import { Clock11Icon, LucideAngularModule, LucideIconData, MessageCircle, MessageCircleIcon, Monitor, User, UserCheck } from "lucide-angular";
import { PillComponent } from "../../../shared/components/ui/pill.component";
import { CommonModule } from "@angular/common";

export type OrigenServicio = 'WhatsApp' | 'Sistema' | 'Empleado';

@Component({
    selector:'agenda-row',
    standalone: true,
    imports: [LucideAngularModule, PillComponent, CommonModule],
    template: `
    <div class="flex items-center justify-between p-4 rounded-lg hover:bg-(--hover-bg-light) dark:hover:bg-(--hover-bg-light)/20 transition-colors
                shadow-sm border border-gray-100 dark:border-gray-700 bg-(--foreground-light) dark:bg-(--foreground-dark)">
                                
        <!-- izquierda: hora + cliente -->
        <div class="flex items-center gap-4">
          <div class="flex flex-col items-center text-center w-20 text-gray-800 dark:text-gray-100">
             <lucide-angular [name]="clockIcon" class="w-5 h-5 text-purple-500"/>
            <span class="text-sm font-medium">{{hora}}</span>
          </div>

          <div>
            <div class="font-medium text-gray-800 dark:text-gray-100">{{nombreCliente}}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{servicioCliente}}</div>
          </div>
        </div>

        <!-- derecha: empleado, origen y estado -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-100">
            <lucide-angular [name]="userIcon" class="w-4 h-4"/>
            <span>{{nombreEmpleado}}</span>
          </div>

          <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-100">
            <lucide-angular [name]="icono" class="w-4 h-4" [ngClass]="colorIcon"/>
            <span class="capitalize">{{origenServicio}}</span>
          </div>

          <div>
            <pill label="Completado" bgClass="bg-green-800" textClass="text-green-100"></pill>
          </div>

          <!-- acciones pequeñas -->
          <div class="flex flex-col gap-2">
            <button class="w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50">↑</button>
            <button class="w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50">↓</button>
          </div>
        </div>
      </div>
    `,
})
export class AgendaRowComponent {

    @Input() hora?: string ='--:--'
    @Input() nombreCliente?:     string = 'Nombre no asignado';
    @Input() servicioCliente?:   string = 'Servicio no asignado';
    @Input() nombreEmpleado?:    string = 'Nombre no encontrado';
    @Input() origenServicio?: OrigenServicio = 'Sistema';

    listIcons: Record<OrigenServicio, LucideIconData>={
      'WhatsApp': MessageCircle  ,
      'Sistema':  Monitor,
      'Empleado': UserCheck,
    }
    listColors: Record<OrigenServicio, string>={
      'WhatsApp': "text-green-600",
      'Sistema': "text-blue-600",
      'Empleado': "text-purple-600"

    }
    
    get icono() {
      return this.origenServicio ? this.listIcons[this.origenServicio] : MessageCircle;
    }

    get colorIcon(){
      return this.origenServicio ? this.listColors[this.origenServicio] : "text-green-200";
    }



    readonly clockIcon = Clock11Icon;
    readonly userIcon = User;
    readonly messageCircleIcon = MessageCircleIcon;



}