import { LayoutDashboard, Building2, Users, UserPlus, ShieldCheck, Settings, ListTree, Hash, Menu as MenuIcon, ScrollText, Shield, MapPin, Server } from 'lucide-angular';
import { NavSection } from '../shell/sidebar.types';

// Los `label` que empiecen por `admin.` se interpretan como claves i18n al
// renderizar (ver sidebar.component). Asi este nav fallback respeta el idioma.
//
// NOTA: en produccion el menu lo sirve el backend (/menus/me). Esto es solo
// el fallback cuando el back aun no responde; lo mantenemos alineado con la
// agrupacion por dominio del nuevo diseño.
export const ADMIN_NAV: NavSection[] = [
  {
    key: 'general',
    label: 'admin.section.general',
    defaultOpen: true,
    items: [
      { key: 'dashboard',   label: 'admin.dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { key: 'tenants_list', label: 'admin.tenants',  icon: Building2,       path: '/admin/tenants' },
    ],
  },
  {
    key: 'access',
    label: 'admin.section.access',
    defaultOpen: true,
    items: [
      { key: 'users_all',     label: 'admin.users',       icon: Users,       path: '/admin/users' },
      { key: 'users_invites', label: 'admin.invitations', icon: UserPlus,    path: '/admin/invitations' },
      { key: 'roles',         label: 'admin.roles',       icon: Shield,      path: '/admin/roles' },
      { key: 'permissions',   label: 'admin.permissions', icon: ShieldCheck, path: '/admin/permissions' },
    ],
  },
  {
    key: 'config',
    label: 'admin.section.config',
    defaultOpen: true,
    items: [
      { key: 'lists',     label: 'admin.lists',     icon: ListTree, path: '/admin/system-lists' },
      { key: 'constants', label: 'admin.constants', icon: Hash,     path: '/admin/constants' },
      { key: 'political', label: 'admin.political',  icon: MapPin,  path: '/admin/political-division' },
      { key: 'menus',     label: 'admin.menus',     icon: MenuIcon, path: '/admin/menus' },
    ],
  },
  {
    key: 'system',
    label: 'admin.section.systemArea',
    defaultOpen: true,
    items: [
      { key: 'system_status', label: 'admin.systemStatus', icon: Server,      path: '/admin/system-status' },
      { key: 'audit',         label: 'admin.audit',        icon: ScrollText,  path: '/admin/audit' },
      { key: 'profile',       label: 'admin.profile',      icon: Settings,    path: '/admin/profile' },
    ],
  },
];
