/**
 * Branding público de una empresa, resuelto por slug antes del login.
 * Espejo de `BrandingResponse` del business-service.
 */
export interface Branding {
  businessId: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  slug: string;
}
