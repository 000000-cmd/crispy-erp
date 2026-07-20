/** Especialidad per-business (Barbería, Estilismo, Manicure...). */
export interface Specialty {
  id: string;
  businessId: string;
  name: string;
  displayOrder?: number;
  enabled?: boolean;
}

/** Categoría de servicios per-business. */
export interface OfferingCategory {
  id: string;
  businessId: string;
  name: string;
  displayOrder?: number;
  enabled?: boolean;
}

export interface CatalogPayload {
  businessId: string;
  name: string;
  displayOrder?: number;
}
