import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { CircleAlert, CircleCheck, Info, LucideAngularModule, TriangleAlert } from "lucide-angular";


@Component({
    selector:'status-chip',
    standalone:true,
    imports:[LucideAngularModule, CommonModule],
    template:`
    <div class="w-full flex justify-center  items-center gap-4
                min-w-18 h-14 border rounded-lg  text-center"
         [ngClass]="estilosChip[variant]">
        <lucide-icon [name]="iconChip[variant]" class="w-8 h-8"/>
        <p>{{label}}</p>
    </div>
    `
})

export class StatusChipComponent{

    @Input() variant: 'ok'| 'warning'| 'danger' | 'neutral' = 'ok';
    @Input() label?: string;

    estilosChip = {
        'ok': 'border-green-300 bg-green-100 text-green-600',
        'warning': 'border-yellow-600 bg-yellow-600 text-yellow-600',
        'danger': 'border-red-600 bg-red-300 text-red-600',
        'neutral': 'border-gray-600 bg-gray-300 text-gray-600',
        
    }

    iconChip= {
        'ok': CircleCheck,
        'warning': TriangleAlert,
        'danger': CircleAlert,
        'neutral': Info,
    }

}