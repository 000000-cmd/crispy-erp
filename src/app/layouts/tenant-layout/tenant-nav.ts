import { Activity, Calendar, ClipboardList, Users, Clock, Package, AlertTriangle, Wallet, Settings, Scissors, MinusCircle, MessageCircle } from 'lucide-angular';
import { NavSection } from '../shell/sidebar.types';

export const TENANT_NAV: NavSection[] = [
  {
    key: 'op',
    label: 'Operación',
    defaultOpen: true,
    items: [
      { key: 'panel',     label: 'Panel',          icon: Activity,        path: '/tenant/dashboard' },
      {
        key: 'citas', label: 'Citas', icon: Calendar, children: [
          { key: 'citas_agenda', label: 'Agenda del día', icon: Clock,         path: '/tenant/citas/agenda' },
          { key: 'citas_hist',   label: 'Historial',      icon: Activity,      path: '/tenant/citas/historial' },
        ],
      },
      {
        key: 'team', label: 'Equipo', icon: Users, children: [
          { key: 'team_emp',  label: 'Empleados', icon: Users, path: '/tenant/empleados' },
          { key: 'team_turn', label: 'Turnos',    icon: Clock, path: '/tenant/empleados/turnos' },
        ],
      },
    ],
  },
  {
    key: 'biz',
    label: 'Negocio',
    defaultOpen: true,
    items: [
      {
        key: 'inventario', label: 'Inventario', icon: Package, children: [
          { key: 'inv_prod',   label: 'Productos',     icon: Package,        path: '/tenant/inventario/productos' },
          { key: 'inv_alerts', label: 'Alertas stock', icon: AlertTriangle,  path: '/tenant/inventario/alertas' },
        ],
      },
      { key: 'nomina', label: 'Nómina', icon: Wallet, path: '/tenant/nomina' },
    ],
  },
  {
    key: 'cfg',
    label: 'Configuración',
    defaultOpen: false,
    items: [
      { key: 'cfg_biz', label: 'Ajustes negocio', icon: Settings, path: '/tenant/configuracion' },
      {
        key: 'catalogs', label: 'Catálogos', icon: ClipboardList, children: [
          { key: 'cfg_serv',  label: 'Tipos de servicio', icon: Scissors,     path: '/tenant/configuracion/servicios' },
          { key: 'cfg_ded',   label: 'Deducciones',       icon: MinusCircle,  path: '/tenant/configuracion/deducciones' },
          { key: 'cfg_int',   label: 'Integraciones',     icon: MessageCircle,path: '/tenant/configuracion/integraciones' },
        ],
      },
      { key: 'profile', label: 'Mi perfil', icon: Settings, path: '/tenant/profile' },
    ],
  },
];
