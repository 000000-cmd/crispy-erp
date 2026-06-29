/** Respuesta paginada de búsqueda (Elasticsearch), espejo del backend. */
export interface SearchResponse<T> {
  items: T[];
  totalHits: number;
  page: number;      // 0-based
  size: number;
  totalPages: number;
  hasNext: boolean;
}

/** Parámetros comunes de búsqueda. Cada vista agrega sus filtros. */
export interface SearchParams {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: string | number | boolean | null | undefined;
}
