import { TagTone } from '../ui/tag/tag.component';

/** Contrato público de la tabla del sistema (columnas y acciones por fila). */
export interface ColumnDef<T = any> {
  key: keyof T & string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  format?: (row: T) => string | number;
  template?: 'pill' | 'switch' | 'text';
  /** Si se define, la celda renderiza una <app-tag> con este label/tono. */
  tag?: (row: T) => { label: string; tone: TagTone } | null;
}

export interface RowAction<T = any> {
  icon?: any;
  label?: string;
  tone?: 'primary' | 'danger' | 'neutral';
  show?: (row: T) => boolean;
  onClick: (row: T) => void;
}
