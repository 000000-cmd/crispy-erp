import { Component, Input, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { BaseTableComponent } from './BaseTableComponent';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { ThemeService } from '../../theme.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'tabla-list',
  standalone: true,
  template: `
    <ag-grid-angular
      class="table-list-gradient"
      style="flex:1 1 0%; width:100%;"
      [style.height]="height"
      [rowData]="rowData"
      [rowHeight]="45"
      [theme]="gridTheme"
      [headerHeight]="0"
      [defaultColDef]="defaultColDef"
      [columnDefs]="columnDefs"
    />
  `,
  imports: [AgGridAngular],
  styleUrls: ['./tabla-lista.css']
})
export class TablaListComponent extends BaseTableComponent {

  constructor(themeService: ThemeService) {
    super(themeService);


      // Sobrescribir bordes para esta tabla
      this.paramsLightTable = {
        ...this.paramsLightTable,
        wrapperBorder: false,
        headerRowBorder: false,
        rowBorder: false
      };

      this.paramsDarkTable = {
        ...this.paramsDarkTable,
        wrapperBorder: false,
        headerRowBorder: false,
        rowBorder: false
      };


    // Config especial de tabla "lista"
    this.defaultColDef = {
        ...this.defaultColDef,
        flex: undefined,          // ❗ Quitar flex heredado
        minWidth: undefined,      // ❗ Evitar interferencia
        filter: false,
        sortable: false,
        menuTabs: []
    };
  }

  // Sobrescribimos columnas y estilos
override ngOnChanges(changes: SimpleChanges) {
  super.ngOnChanges(changes);

  this.columnDefs = this.columnDefs.map((col, index) => {
    const base = {
      ...col,
      headerName: ''
    };

    if (index === 0) {
      return {
        ...base,
        width: 120,
        suppressSizeToFit: true   // funciona ahora que NO hay flex global
      };
    }

    if (index === 1) {
      return {
        ...base,
        flex: 1,      // ⭐ ahora sí se aplica
        minWidth: 150
      };
    }

    if (index === 2) {
      return {
        ...base,
        width: 200,   // reemplaza autoSize (AG-Grid no lo soporta en colDefs)
        minWidth: 120,
        maxWidth: 250
      };
    }

    return base;
  });
}

}
