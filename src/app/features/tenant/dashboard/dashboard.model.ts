/** Tarjeta de conteo del panel del dueño (valor real + ruta de gestión). */
export interface Kpi {
  key: string;
  label: string;
  value: number;
  icon: any;
  route: string;
}

/** Paso del checklist de "completar empresa" (mínimo para operar). */
export interface CompletionStep {
  label: string;
  hint: string;
  done: boolean;
  route: string;
}
