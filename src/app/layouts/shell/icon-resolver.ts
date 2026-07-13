import {
  Activity, AlertTriangle, Building2, Calendar, ChartColumn, ClipboardList,
  Clock, DollarSign, FileText, Globe, Hash, Inbox, KeyRound, LayoutDashboard,
  ListTree, Mail, MapPin, Menu as MenuIcon, MessageCircle, MinusCircle, Package,
  Percent, Scissors, ScrollText, Settings, Shield, ShieldCheck, Sliders,
  User, UserPlus, Users, Wallet, Activity as DefaultIcon, Box, Tags,
} from 'lucide-angular';

/**
 * Mapa string -> lucide icon. Las claves se aceptan tanto en kebab-case
 * (formato del back, ej. "shield-check") como en snake/lowercase ("shield_check").
 * Si el icono no existe, devuelve DefaultIcon para evitar que el sidebar se rompa.
 */
const MAP: Record<string, any> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  box: Box,
  building2: Building2,
  building: Building2,
  'building-2': Building2,
  globe: Globe,
  'map-pin': MapPin,
  calendar: Calendar,
  'chart-column': ChartColumn,
  'clipboard-list': ClipboardList,
  clock: Clock,
  'dollar-sign': DollarSign,
  dashboard: LayoutDashboard,
  'file-text': FileText,
  hash: Hash,
  inbox: Inbox,
  key: KeyRound,
  'key-round': KeyRound,
  'layout-dashboard': LayoutDashboard,
  list: ListTree,
  'list-tree': ListTree,
  mail: Mail,
  menu: MenuIcon,
  'message-circle': MessageCircle,
  'minus-circle': MinusCircle,
  package: Package,
  percent: Percent,
  scissors: Scissors,
  'scroll-text': ScrollText,
  settings: Settings,
  shield: Shield,
  'shield-check': ShieldCheck,
  sliders: Sliders,
  tags: Tags,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  wallet: Wallet,
};

export function resolveIcon(name: string | null | undefined): any {
  if (!name) return DefaultIcon;
  const key = String(name).toLowerCase().replace(/_/g, '-');
  return MAP[key] ?? DefaultIcon;
}
