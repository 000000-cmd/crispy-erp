import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'admin',  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: 'tenant', loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES) },
  { path: '**', redirectTo: 'login' },
];
