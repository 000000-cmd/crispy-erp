import { Component } from "@angular/core";
import { TabsComponent } from "../../shared/components/ui/tabs.component";
import {  ActivatedRoute, Router, RouterModule } from "@angular/router";


@Component({
    selector: 'app-configuracion',
    templateUrl: './config.component.html',
    imports: [TabsComponent, RouterModule],
})
export class ConfiguracionComponent {

    constructor(private router: Router, private route: ActivatedRoute) {}

  currentTab = 'Tipos de Servicio';

  columnTabs = ['Tipos de Servicio', 'Comisiones', 'Deducciones'];

  linkMap: Record<string, string> = {
    'Tipos de Servicio': 'tipoServicio',
    'Comisiones': 'comisiones',
    'Deducciones': 'deducciones',
  };

  handleTabChange(tab: string) {
    this.currentTab = tab;
    const path = this.linkMap[tab];
    if (path) {
      this.router.navigate([path], { relativeTo: this.route });
    }
  }
  ngOnInit() {
  // Detectar la ruta activa del hijo
  this.route.firstChild?.url.subscribe(url => {
    const currentPath = url[0]?.path;

    // Encontrar la key del tab según el path
    const matchedTab = Object.keys(this.linkMap)
      .find(tab => this.linkMap[tab] === currentPath);

    if (matchedTab) {
      this.currentTab = matchedTab;
    }
  });
}

}
