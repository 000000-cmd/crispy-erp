import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { BaseTableComponent } from './BaseTableComponent';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { ThemeService } from '../../theme.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'tabla-grid',
  standalone: true,
  template: `
    <ag-grid-angular
      style="flex:1 1 0%; width:100%;"
      [style.height]="height"
      [rowData]="rowData"
      [rowHeight]="45"
      [theme]="gridTheme"
      [defaultColDef]="defaultColDef"
      [columnDefs]="columnDefs"
      [localeText]="localeText"
      suppressDragLeaveHidesColumns = false;

    />
  `,
  imports: [AgGridAngular],
})
export class TablaGridComponent extends BaseTableComponent {

  constructor(themeService: ThemeService) {
    super(themeService);

    // Config especial de tabla "completa"
    this.defaultColDef = {
      ...this.defaultColDef,
      filter: true,
      sortable: false
    };
  }
}
