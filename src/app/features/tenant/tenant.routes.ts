import { Routes } from '@angular/router';
import { TenantLayoutComponent } from '../../layouts/tenant-layout/tenant-layout.component';
import { authGuard, kindGuard } from '../../core/auth/guards';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    component: TenantLayoutComponent,
    canActivate: [authGuard, kindGuard('TENANT_USER')],
    data: { crumb: 'Operación' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard', data: { crumb: 'Panel' },
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.TenantDashboardComponent),
      },
      {
        path: 'onboarding', data: { crumb: 'Crear mi negocio' },
        loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent),
      },
      {
        path: 'mi-negocio', data: { crumb: 'Mi negocio' },
        loadComponent: () => import('./business/my-business.component').then(m => m.MyBusinessComponent),
      },
      {
        path: 'servicios', data: { crumb: 'Servicios' },
        loadComponent: () => import('./servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'sedes', data: { crumb: 'Sedes' },
        loadComponent: () => import('./sedes/sedes.component').then(m => m.SedesComponent),
      },
      {
        path: 'empleados', data: { crumb: 'Empleados' },
        loadComponent: () => import('./empleados/empleados.component').then(m => m.EmpleadosComponent),
      },
      {
        path: 'profile', data: { crumb: 'Mi perfil' },
        loadComponent: () => import('./profile/profile.component').then(m => m.TenantProfileComponent),
      },
      { path: '**', loadComponent: () => import('../../shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
];
