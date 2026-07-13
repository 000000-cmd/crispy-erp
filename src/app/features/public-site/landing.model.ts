import { environment } from '../../../environments/environments';

/** Contenido editable de la página pública (espejo de business_landing). */
export interface BusinessLanding {
  id?: string;
  businessId?: string;
  tagline?: string | null;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  contactEmail?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  heroImageUrl?: string | null;
  /** Arreglo JSON serializado de URLs (wire format del back). */
  galleryJson?: string | null;
  scheduleText?: string | null;
  published?: boolean;
}

/** Payload del PUT (upsert): documento completo de la landing. */
export type BusinessLandingPayload = Omit<BusinessLanding, 'id' | 'businessId'>;

/** Agregado que pinta la página pública en UN request (GET /public/landing). */
export interface PublicLanding {
  business: {
    id: string; name: string; logoUrl?: string | null;
    primaryColor?: string | null; secondaryColor?: string | null; slug: string;
  };
  landing: {
    tagline?: string | null; about?: string | null; phone?: string | null; whatsapp?: string | null;
    contactEmail?: string | null; instagram?: string | null; facebook?: string | null;
    heroImageUrl?: string | null; galleryJson?: string | null; scheduleText?: string | null;
  };
  branches: { name: string; addressLine?: string | null; phone?: string | null }[];
  offerings: { name: string; description?: string | null; price: number; durationMinutes: number }[];
}

/** URLs de assets del back son relativas al gateway → se prefijan con el apiUrl. */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith('http') ? path : `${environment.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** GalleryJson (string) → lista de URLs absolutas ya utilizables. */
export function parseGallery(galleryJson: string | null | undefined): string[] {
  if (!galleryJson) return [];
  try {
    const arr = JSON.parse(galleryJson);
    return Array.isArray(arr) ? arr.filter(u => typeof u === 'string').map(u => assetUrl(u)!) : [];
  } catch {
    return [];
  }
}
