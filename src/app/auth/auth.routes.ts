import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../layout/public/public-layout.component';





export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent ,
    children: [
        {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m =>m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m =>m.RegisterComponent)
      },

    ]
  }

];
