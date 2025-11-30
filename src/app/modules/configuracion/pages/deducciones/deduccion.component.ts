import { Component } from "@angular/core";
import { ContainerComponent } from "../../../../shared/components/ui/container.component";
import { InputCleanComponent } from "../../../../shared/components/forms/inputs/input-clean.component";
import { PillComponent } from "../../../../shared/components/ui/pill.component";
import { AlertCalloutComponent } from "../../../../shared/components/alertas/alert-callout.component";
import { LucideAngularModule, Save } from "lucide-angular";


@Component({
    selector: 'deduccion',
    standalone: true,
    templateUrl: 'deduccion.component.html',
    imports:[ContainerComponent, InputCleanComponent, PillComponent, AlertCalloutComponent,
        LucideAngularModule
    ],
})

export class DeduccionComponent {

    readonly saveIcon = Save;

    readonly porcentajeActual= "Actual: 10%";
    
}