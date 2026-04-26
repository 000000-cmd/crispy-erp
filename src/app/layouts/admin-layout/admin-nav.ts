import { Building2, Users, UserPlus, ShieldCheck, Settings, ListTree, Hash, Menu as MenuIcon, FileText, ScrollText, Shield } from 'lucide-angular';
import { NavSection } from '../shell/sidebar.types';

export const ADMIN_NAV: NavSection[] = [
  {
    key: 'tenants',
    label: 'Tenants',
    defaultOpen: true,
    items: [
      { key: 'tenants_list', label: 'Empresas', icon: Building2, path: '/admin/tenants' },
    ],
  },
  {
    key: 'users',
    label: 'Usuarios',
    defaultOpen: true,
    items: [
      { key: 'users_all',     label: 'Todos los usuarios', icon: Users, path: '/admin/users' },
      { key: 'users_invites', label: 'Invitaciones',       icon: UserPlus, path: '/admin/invitations' },
    ],
  },
  {
    key: 'system',
    label: 'Sistema',
    defaultOpen: true,
    items: [
      {
        key: 'catalogs', label: 'Catálogos', icon: ListTree, children: [
          { key: 'catalogs_lists', label: 'Listas',     icon: ListTree, path: '/admin/system-lists' },
          { key: 'catalogs_const', label: 'Constantes', icon: Hash,     path: '/admin/constants' },
        ],
      },
      { key: 'menus', label: 'Menús', icon: MenuIcon, path: '/admin/menus' },
    ],
  },
  {
    key: 'security',
    label: 'Seguridad',
    defaultOpen: true,
    items: [
      { key: 'roles',       label: 'Roles',     icon: Shield,       path: '/admin/roles' },
      { key: 'permissions', label: 'Permisos',  icon: ShieldCheck,  path: '/admin/permissions' },
      { key: 'audit',       label: 'Auditoría', icon: ScrollText,   path: '/admin/audit' },
    ],
  },
  {
    key: 'settings',
    label: 'Preferencias',
    defaultOpen: false,
    items: [
      { key: 'profile', label: 'Mi perfil', icon: Settings, path: '/admin/profile' },
    ],
  },
];
