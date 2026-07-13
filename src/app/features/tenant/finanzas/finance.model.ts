/**
 * Modelos de compensación (finance-service). Un solo `compensationValue` cuyo
 * significado depende del tipo: monto fijo (COP) para SALARY_ONLY, porcentaje
 * para los demás. La resolución en cascada (empleado→sede→empresa) vive en el
 * back; aquí se replica solo para PRECARGAR la UI.
 */

export type CompensationType =
  | 'SALARY_ONLY'
  | 'SALARY_PLUS_COMMISSION'
  | 'SALARY_PLUS_SERVICE_PERCENT'
  | 'SERVICE_PERCENT_ONLY';

export interface Compensation {
  id: string;
  compensationType: CompensationType;
  compensationValue: number;
  validFrom?: string;
  validTo?: string | null;
}

/** Nivel dueño del registro que se está viendo (para el badge de herencia). */
export type CompensationLevel = 'business' | 'branch' | 'employee';

export interface CompensationDraft {
  compensationType: CompensationType;
  compensationValue: number | null;
}

/** Metadatos de presentación de cada tipo (UI). */
export const COMP_TYPES: {
  code: CompensationType;
  label: string;
  kind: 'money' | 'percent';
  hint: string;
}[] = [
  { code: 'SALARY_ONLY', label: 'Solo salario', kind: 'money', hint: 'Paga un salario fijo mensual' },
  { code: 'SALARY_PLUS_COMMISSION', label: 'Salario + comisión', kind: 'percent', hint: 'Salario base más % de comisión por ventas' },
  { code: 'SALARY_PLUS_SERVICE_PERCENT', label: 'Salario + % servicio', kind: 'percent', hint: 'Salario base más % de cada servicio realizado' },
  { code: 'SERVICE_PERCENT_ONLY', label: 'Solo % de servicio', kind: 'percent', hint: 'El colaborador recibe un % de cada servicio' },
];

export function compTypeMeta(code: CompensationType) {
  return COMP_TYPES.find(t => t.code === code) ?? COMP_TYPES[3];
}
