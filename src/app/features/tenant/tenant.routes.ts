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
        path: 'profile', data: { crumb: 'Mi perfil' },
        loadComponent: () => import('./profile/profile.component').then(m => m.TenantProfileComponent),
      },
    ],
  },
];
