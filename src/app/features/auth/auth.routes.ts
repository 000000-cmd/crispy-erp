import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { guestGuard } from '../../core/auth/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: '',loadComponent: () => import('./login/login.page').then(m => m.LoginPage) }],
  },
];
