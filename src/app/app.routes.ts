import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/ui/not-found/not-found.component';

export const routes: Routes = [
  // Home: landing pública. Engancha y deriva al login (dueño) o al registro.
  // El acceso de administradores NO se expone aquí (ruta aparte y directa).
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login',  loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'admin',  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  // Área del dueño (tenant): NO comparte rutas con el admin del sistema.
  { path: 'tenant', loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES) },
  // Cualquier ruta desconocida muestra la vista 404 (ya no manda al login).
  { path: '**', component: NotFoundComponent },
];
