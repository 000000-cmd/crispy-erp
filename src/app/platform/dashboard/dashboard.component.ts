import { Component } from "@angular/core";
import { TabsComponent } from "../../shared/components/ui/tabs.component";
import { Building2, Crown } from "lucide-angular";
import { IconBadgeComponent } from "../../shared/components/ui/icon-badge.component";
import { StatusChipComponent } from "../../shared/components/ui/status-chip.component";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { ButtonCleanComponent } from "../../shared/components/buttons/button-clean.component";
import { InputCleanComponent } from "../../shared/components/forms/inputs/input-clean.component";
import { CardModuleComponent } from "../../shared/components/cards/card-module.component";


@Component({
    selector: 'dashboard',
    standalone:true,
    imports: [TabsComponent ,IconBadgeComponent, StatusChipComponent, 
            ContainerComponent, ButtonCleanComponent, InputCleanComponent, CardModuleComponent],
    templateUrl:'./dashboard.component.html'
    
})

export class DashboardComponent {

    readonly rentIcon = Building2;
    readonly coronaIcon = Crown;
    
}