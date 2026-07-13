/**
 * Dinero en pesos colombianos (COP): el proyecto opera en Colombia y los
 * precios se manejan sin decimales. Un solo lugar para formatear/parsear —
 * lo usan las cards de servicios, el campo `money` del dynamic-form y la
 * vista de compensaciones.
 */

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `25000 → "$ 25.000"`. Null/undefined/NaN → cadena vacía. */
export function formatCOP(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '';
  return COP.format(value);
}

/** Solo los dígitos de un string enmascarado (`"$ 25.000" → 25000`). Vacío → null. */
export function parseCOP(masked: string): number | null {
  const digits = (masked ?? '').replace(/\D+/g, '');
  return digits ? Number(digits) : null;
}

/** Máscara en vivo mientras se escribe: separadores de miles sin símbolo (`25000 → "25.000"`). */
export function maskThousands(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);
}
