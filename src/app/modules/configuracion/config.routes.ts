import { Routes } from '@angular/router';
import { ConfiguracionComponent } from './config.component';





export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    component: ConfiguracionComponent,
    children: [
        {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tipoServicio'
      },
      {
        path: 'tipoServicio',
        loadComponent: () => import('./pages/tipoServicio/tipoServicio.component').then(m => m.TipoServicioComponent)
      },
      {
        path: 'comisiones',
        loadComponent: () => import('./pages/comisiones/comisiones.component').then(m => m.ComisionesComponent)
      },
        {
        path: 'deducciones',
        loadComponent: () => import('./pages/deducciones/deduccion.component').then(m => m.DeduccionComponent)
      }
    ]
  }

];
