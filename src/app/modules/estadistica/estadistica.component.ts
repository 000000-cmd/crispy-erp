import { Component } from "@angular/core";
import { LucideAngularModule, Users } from "lucide-angular";
import { CardStatComponent } from "../../shared/components/cards/card-stat.component";
import { ChartLineComponent } from "../../shared/components/graficos/chart-line.component";
import { ChartBarComponent } from "../../shared/components/graficos/chart-bar.component";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { TableRecentActivityComponent } from "./components/table-recentActivity.component";


@Component({
  selector: "estadistica",
  templateUrl: "./estadistica.component.html",
  standalone: true,
  imports: [LucideAngularModule, ChartLineComponent, ChartBarComponent,
            CardStatComponent,  ContainerComponent, TableRecentActivityComponent],
})
export class EstadisticaComponent {


  readonly clientesIcon = Users;


}