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
      { path: 'dashboard',     data: { crumb: 'Panel' },        loadComponent: () => import('./dashboard/dashboard.page').then(m => m.AdminDashboardPage) },
      { path: 'users',         data: { crumb: 'Usuarios' },     loadComponent: () => import('./users/users.page').then(m => m.AdminUsersPage) },
      { path: 'invitations',   data: { crumb: 'Invitaciones' }, loadComponent: () => import('./stubs/admin-stub.pages').then(m => m.AdminInvitationsPage) },
      { path: 'tenants',       data: { crumb: 'Empresas' },     loadComponent: () => import('./stubs/admin-stub.pages').then(m => m.AdminTenantsPage) },
      { path: 'system-lists',  data: { crumb: 'Listas' },       loadComponent: () => import('./system-lists/system-lists.page').then(m => m.AdminSystemListsPage) },
      { path: 'constants',     data: { crumb: 'Constantes' },   loadComponent: () => import('./constants/constants.page').then(m => m.AdminConstantsPage) },
      { path: 'menus',         data: { crumb: 'Menús' },        loadComponent: () => import('./menus/menus.page').then(m => m.AdminMenusPage) },
      { path: 'roles',         data: { crumb: 'Roles' },        loadComponent: () => import('./roles/roles.page').then(m => m.AdminRolesPage) },
      { path: 'permissions',   data: { crumb: 'Permisos' },     loadComponent: () => import('./permissions/permissions.page').then(m => m.AdminPermissionsPage) },
      { path: 'audit',         data: { crumb: 'Auditoría' },    loadComponent: () => import('./stubs/admin-stub.pages').then(m => m.AdminAuditPage) },
      { path: 'profile',       data: { crumb: 'Mi perfil' },    loadComponent: () => import('./profile/profile.page').then(m => m.AdminProfilePage) },
      // Cualquier subruta admin/xxx desconocida cae aqui — se ve el sidebar y
      // la 404 en el area de contenido en vez de patear al login.
      { path: '**', loadComponent: () => import('../../shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
];
