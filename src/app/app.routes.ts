import { Routes } from '@angular/router';



export const routes: Routes = [

    {
    path: 'inventario',
    loadChildren: () =>
      import('./modules/inventario/inventario.routes')
        .then(m => m.INVENTARIO_ROUTES)
    }
    ,
  {
    path: 'estadistica',
    loadChildren: () =>
      import('./modules/estadistica/estadistica.routes')
        .then(m => m.ESTADISTICA_ROUTES)
  },

  {
    path: 'citas',
    loadChildren: () =>
      import('./modules/citas/citas.routes')
        .then(m => m.CITAS_ROUTES)
  },
 
  {
    path: 'empleados',
    loadChildren: () =>
      import('./modules/empleados/empleados.routes')
        .then(m => m.EMPLEADOS_ROUTES)
  },

  {
    path: 'nomina',
    loadChildren: () =>
      import('./modules/nomina/nomina.routes')
        .then(m => m.NOMINA_ROUTES)
  },
      
  {
    path: 'config',
    loadChildren: () =>
      import('./modules/configuracion/config.routes')
        .then(m => m.CONFIG_ROUTES)
  },
/*
  // Ruta vacía → redirige a algo por defecto
  { path: '', redirectTo: '/estadistica', pathMatch: 'full' },

  // 404
  { path: '**', redirectTo: '/estadistica' }*/
];
