import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { authGuard, kindGuard } from '../../core/auth/guards';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, kindGuard('SYSTEM_ADMIN')],
    data: { crumb: 'Admin' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard',     data: { crumb: 'Panel' },        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users',         data: { crumb: 'Usuarios' },     loadComponent: () => import('./users/users.component').then(m => m.AdminUsersComponent) },
      { path: 'invitations',   data: { crumb: 'Invitaciones' }, loadComponent: () => import('./stubs/admin-stubs.component').then(m => m.AdminInvitationsComponent) },
      { path: 'tenants',       data: { crumb: 'Empresas' },     loadComponent: () => import('./stubs/admin-stubs.component').then(m => m.AdminTenantsComponent) },
      { path: 'system-lists',  data: { crumb: 'Listas' },       loadComponent: () => import('./system-lists/system-lists.component').then(m => m.AdminSystemListsComponent) },
      { path: 'political-division', data: { crumb: 'División política' }, loadComponent: () => import('./political-division/political-division.component').then(m => m.PoliticalDivisionComponent) },
      { path: 'constants',     data: { crumb: 'Constantes' },   loadComponent: () => import('./constants/constants.component').then(m => m.AdminConstantsComponent) },
      { path: 'menus',         data: { crumb: 'Menús' },        loadComponent: () => import('./menus/menus.component').then(m => m.AdminMenusComponent) },
      { path: 'system-status', data: { crumb: 'Estado del sistema' }, loadComponent: () => import('./system-status/system-status.component').then(m => m.AdminSystemStatusComponent) },
      { path: 'roles',         data: { crumb: 'Roles' },        loadComponent: () => import('./roles/roles.component').then(m => m.AdminRolesComponent) },
      { path: 'permissions',   data: { crumb: 'Permisos' },     loadComponent: () => import('./permissions/permissions.component').then(m => m.AdminPermissionsComponent) },
      { path: 'audit',         data: { crumb: 'Auditoría' },    loadComponent: () => import('./stubs/admin-stubs.component').then(m => m.AdminAuditComponent) },
      { path: 'profile',       data: { crumb: 'Mi perfil' },    loadComponent: () => import('./profile/profile.component').then(m => m.AdminProfileComponent) },
      // Cualquier subruta admin/xxx desconocida cae aqui — se ve el sidebar y
      // la 404 en el area de contenido en vez de patear al login.
      { path: '**', loadComponent: () => import('../../shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
];
