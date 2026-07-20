import { Routes } from '@angular/router';
import { TenantLayoutComponent } from '../../layouts/tenant-layout/tenant-layout.component';
import { authGuard, kindGuard, requiresBusiness, onboardingGate } from '../../core/auth/guards';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    component: TenantLayoutComponent,
    canActivate: [authGuard, kindGuard('TENANT_USER')],
    data: { crumb: 'Operación' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard', data: { crumb: 'Panel' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.TenantDashboardComponent),
      },
      {
        // Gate de primera vez: si ya hay negocio, redirige al dashboard.
        path: 'onboarding', data: { crumb: 'Crear mi negocio' }, canActivate: [onboardingGate],
        loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent),
      },
      {
        path: 'mi-negocio', data: { crumb: 'Mi negocio' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./business/my-business.component').then(m => m.MyBusinessComponent),
      },
      {
        path: 'servicios', data: { crumb: 'Servicios' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'sedes', data: { crumb: 'Sedes' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./sedes/sedes.component').then(m => m.SedesComponent),
      },
      {
        path: 'empleados', data: { crumb: 'Empleados' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./empleados/empleados.component').then(m => m.EmpleadosComponent),
      },
      {
        path: 'compensaciones', data: { crumb: 'Compensaciones' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./finanzas/compensaciones.component').then(m => m.CompensacionesComponent),
      },
      {
        path: 'liquidaciones', data: { crumb: 'Liquidaciones' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./finanzas/liquidaciones.component').then(m => m.LiquidacionesComponent),
      },
      {
        path: 'mi-pagina', data: { crumb: 'Mi página' }, canActivate: [requiresBusiness],
        loadComponent: () => import('./pagina/mi-pagina.component').then(m => m.MiPaginaComponent),
      },
      {
        path: 'profile', data: { crumb: 'Mi perfil' },
        loadComponent: () => import('./profile/profile.component').then(m => m.TenantProfileComponent),
      },
      { path: '**', loadComponent: () => import('../../shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
];
