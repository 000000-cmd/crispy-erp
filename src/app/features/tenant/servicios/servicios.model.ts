/** Servicio que ofrece la empresa (business_offering). */
export interface Offering {
  id: string;
  businessId: string;
  categoryId?: string | null;
  specialtyId?: string | null;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
  enabled?: boolean;
}

export interface OfferingPayload {
  businessId: string;
  categoryId?: string | null;
  specialtyId?: string | null;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}
