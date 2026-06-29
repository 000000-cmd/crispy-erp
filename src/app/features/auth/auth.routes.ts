import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { guestGuard } from '../../core/auth/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      // Login del dueño (tematizado por subdominio) — entrada por defecto.
      { path: '', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      // Login de administradores del sistema (plano, sin branding).
      { path: 'admin', loadComponent: () => import('./admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
      // Wizard de registro de negocio (alta de dueño).
      { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
    ],
  },
];
