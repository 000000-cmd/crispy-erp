/**
 * Modelos del subsistema de listas/catálogos del sistema.
 *
 * - {@link SystemList}: meta-registro (declara qué catálogos existen),
 *   espejo de `SystemListResponse` (`/system-lists`).
 * - {@link CatalogItem}: item de un catálogo concreto, espejo de
 *   `CatalogResponse` (`/list/{catalogName}`); todos comparten forma porque
 *   heredan de `BaseCatalogDomain` en el back.
 */
export interface SystemList {
  id: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  visible: boolean;
}

export interface SystemListRequest {
  code: string;
  name: string;
  description?: string;
}

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  value?: string;
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
}

export interface CatalogRequest {
  code: string;
  name: string;
  value?: string;
  displayOrder: number;
}
