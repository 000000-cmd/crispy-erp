/**
 * Modelo del dominio Menú (config de navegación por rol, espejo del back).
 * Único punto de verdad: lo consumen el sidebar (menus/me) y la administración
 * de menús (CRUD), para no duplicar el tipo en cada api.
 */
export interface MenuNode {
  id: string;
  code: string;
  name: string;
  icon?: string;
  route?: string | null;
  parentId?: string | null;
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
  children: MenuNode[];
}

/** Payload de creación/edición de un menú (administración). */
export interface MenuPayload {
  code: string;
  name: string;
  icon?: string;
  route?: string | null;
  parentId?: string | null;
  displayOrder: number;
}
