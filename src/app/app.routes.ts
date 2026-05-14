import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/ui/not-found/not-found.component';

export const routes: Routes = [
  // Home: lo decide el guard. Si hay sesion el authGuard del area destino te
  // deja entrar; si no, guestGuard manda al login. Por defecto vamos a /login,
  // pero no fuerza al admin si ya estas logueado en otra pestaña.
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login',  loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'admin',  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: 'tenant', loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES) },
  // Cualquier ruta desconocida muestra la vista 404 (ya no manda al login).
  { path: '**', component: NotFoundComponent },
];
