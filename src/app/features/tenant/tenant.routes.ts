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
        loadComponent: () => import('./dashboard/dashboard.page').then(m => m.TenantDashboardPage),
      },
      {
        path: 'profile', data: { crumb: 'Mi perfil' },
        loadComponent: () => import('./profile/profile.page').then(m => m.TenantProfilePage),
      },
    ],
  },
];
