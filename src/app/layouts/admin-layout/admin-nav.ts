import { Building2, Users, UserPlus, ShieldCheck, Settings, ListTree, Hash, Menu as MenuIcon, FileText, ScrollText, Shield } from 'lucide-angular';
import { NavSection } from '../shell/sidebar.types';

// Los `label` que empiecen por `admin.` se interpretan como claves i18n al
// renderizar (ver sidebar.component). Asi este nav fallback respeta el idioma.
export const ADMIN_NAV: NavSection[] = [
  {
    key: 'tenants',
    label: 'admin.section.tenants',
    defaultOpen: true,
    items: [
      { key: 'tenants_list', label: 'Empresas', icon: Building2, path: '/admin/tenants' },
    ],
  },
  {
    key: 'users',
    label: 'admin.section.users',
    defaultOpen: true,
    items: [
      { key: 'users_all',     label: 'admin.users', icon: Users, path: '/admin/users' },
      { key: 'users_invites', label: 'Invitaciones',       icon: UserPlus, path: '/admin/invitations' },
    ],
  },
  {
    key: 'system',
    label: 'admin.section.system',
    defaultOpen: true,
    items: [
      {
        key: 'catalogs', label: 'Catálogos', icon: ListTree, children: [
          { key: 'catalogs_lists', label: 'admin.lists',     icon: ListTree, path: '/admin/system-lists' },
          { key: 'catalogs_const', label: 'admin.constants', icon: Hash,     path: '/admin/constants' },
        ],
      },
      { key: 'menus', label: 'admin.menus', icon: MenuIcon, path: '/admin/menus' },
    ],
  },
  {
    key: 'security',
    label: 'admin.section.security',
    defaultOpen: true,
    items: [
      { key: 'roles',       label: 'admin.roles',       icon: Shield,       path: '/admin/roles' },
      { key: 'permissions', label: 'admin.permissions', icon: ShieldCheck,  path: '/admin/permissions' },
      { key: 'audit',       label: 'Auditoría', icon: ScrollText,   path: '/admin/audit' },
    ],
  },
  {
    key: 'settings',
    label: 'admin.section.preferences',
    defaultOpen: false,
    items: [
      { key: 'profile', label: 'Mi perfil', icon: Settings, path: '/admin/profile' },
    ],
  },
];
