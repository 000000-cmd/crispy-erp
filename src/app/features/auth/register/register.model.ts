/**
 * Alta de un dueño + su negocio (registro mínimo, self-service).
 * Espejo de `RegisterOwnerRequest` del auth-service. El back crea la cuenta del
 * dueño con rol OWNER y devuelve los tokens para iniciar sesión de inmediato.
 */
export interface RegisterOwnerRequest {
  // Negocio
  businessName: string;
  slug: string;
  // Dueño
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}
