/**
 * Alta self-service de un dueño — registro MÍNIMO (solo cuenta).
 * Espejo de `RegisterOwnerRequest` del auth-service. El back crea la cuenta con
 * rol OWNER y devuelve los tokens para iniciar sesión de inmediato. Los datos del
 * negocio se completan luego (modal + widget de completar-empresa), no aquí.
 */
export interface RegisterOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}
