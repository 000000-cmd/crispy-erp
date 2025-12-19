import { CommonModule } from "@angular/common";
import { Component,  Input } from "@angular/core";
import { LucideAngularModule, LucideIconData } from "lucide-angular";


@Component({
    selector:'icon-badge',
    standalone: true,
    imports:[LucideAngularModule, CommonModule],
    template:`
    <div class="w-16 h-16 rounded-lg flex justify-center items-center" [ngClass]="estilosBadge[color]">
        <lucide-angular [name]="icon" class="w-8 h-8  text-white"></lucide-angular>
    </div>
    
    `
})

export class IconBadgeComponent{

    @Input() icon?: LucideIconData;
    @Input() color: 'green'| 'red'| 'gray' | 'blue' = 'blue';
    

    estilosBadge = {
        'green': 'border-green-600 bg-green-300 text-green-600',
        'red': 'border-red-600 bg-red-300 text-red-600',
        'gray': 'border-gray-600 bg-gray-300 text-gray-600',
        'blue': 'border-blue-600 bg-blue-600 text-blue-600'
        
    }

}