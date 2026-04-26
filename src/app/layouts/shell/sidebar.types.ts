export interface NavItem {
  key: string;
  label: string;
  icon?: any;
  path?: string;
  badge?: number | string;
  children?: NavItem[];
}

export interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}
