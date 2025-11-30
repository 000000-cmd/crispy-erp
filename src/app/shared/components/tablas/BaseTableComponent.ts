import { Input, OnInit, OnChanges, Directive, SimpleChanges } from '@angular/core';
import { ThemeService } from '../../theme.service';
import {
  ColDef,
  colorSchemeDarkBlue,
  colorSchemeLightWarm,
  themeMaterial
} from 'ag-grid-community';
import { PillRendererComponent } from './PillRenderer.Component';
import { AG_GRID_LOCALE_ES } from '../../utils/lang/es-ES';

interface dataHeaders {
  label: string;
  key: string;
  type?: string;
}

@Directive()
export abstract class BaseTableComponent implements OnInit, OnChanges {

  @Input() rowData: any[] = [];
  @Input() headers: dataHeaders[] = [];
  @Input() keys: string[] = [];
  @Input() height: string = "550px";

  columnDefs: ColDef[] = [];
  gridTheme: any;

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100
  };

  paramsLightTable = {
    wrapperBorder: true,
    headerRowBorder: true,
    wrapperBorderRadius: 8,
    rowBorder: true
  };

  paramsDarkTable = {
    wrapperBorder: true,
    headerRowBorder: true,
    wrapperBorderRadius: 8,
    borderColor: "#9696C8",
    headerTextColor: "#FFFFFF",
    headerBackgroundColor: "#2A3340",
    rowBorder: true
  };

  localeText = AG_GRID_LOCALE_ES


  constructor(protected themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(mode => {
      this.gridTheme =
        mode === 'dark'
          ? themeMaterial.withPart(colorSchemeDarkBlue).withParams(this.paramsDarkTable)
          : themeMaterial.withPart(colorSchemeLightWarm).withParams(this.paramsLightTable);
    });
  }

    ngOnChanges(changes: SimpleChanges) {
    if (this.headers && this.keys) {
        this.columnDefs = this.headers.map(col => ({
        headerName: col.label,
        field: col.key,
        cellRenderer: col.type === 'pill' ? PillRendererComponent : undefined
        }));
    }
    }

}
