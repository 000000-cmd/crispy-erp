/**
 * Constante del sistema (espejo de `ConstantResponse`). El valor viaja como
 * string; los condicionales de negocio comparan por CÓDIGO (patrón MAYEDAD).
 */
export interface Constant {
  id: string;
  code: string;
  name: string;
  value: string;
  description?: string;
  enabled: boolean;
}
