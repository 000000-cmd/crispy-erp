import { AbstractControl } from '@angular/forms';
import { FieldState } from '../../ui/field-status/field-status.component';

/**
 * Deriva el estado visual (idle/valid/error/warn) de un control reactivo:
 *   - sin interacción (ni touched ni dirty) → `idle`.
 *   - válido → `valid`.
 *   - inválido y VACÍO → `error` (falló una validación principal, ej. requerido).
 *   - inválido pero con valor → `warn` (lleno pero no cumple, ej. correo inválido).
 */
export function fieldStateOf(c: AbstractControl | null | undefined): FieldState {
  if (!c || !(c.touched || c.dirty)) return 'idle';
  if (c.valid) return 'valid';
  const v = c.value;
  const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
  return empty ? 'error' : 'warn';
}
