import { Type } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export type FieldType =
  | 'text' | 'email' | 'password' | 'number' | 'textarea'
  | 'select' | 'multiselect' | 'autocomplete'
  | 'radio' | 'checkbox-group' | 'checkbox' | 'switch'
  | 'date' | 'time' | 'datetime'
  | 'file' | 'color' | 'hidden'
  | 'custom';

export interface Option {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  group?: string;
  meta?: Record<string, unknown>;
}

export type OptionsSource =
  | Option[]
  | (() => Option[] | Promise<Option[]> | Observable<Option[]>)
  | ((ctx: FieldHookCtx) => Option[] | Promise<Option[]> | Observable<Option[]>);

export interface ValidatorBuiltin {
  kind: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';
  value?: number | string | RegExp;
  message?: string;
}

export type FieldValidator =
  | 'required' | 'email'
  | ValidatorBuiltin
  | ValidatorFn
  | { async: AsyncValidatorFn };

export interface FieldHookCtx {
  form: FormGroup;
  control: AbstractControl;
  field: FieldConfig;
  injector: any;          // Angular EnvironmentInjector — services available
  value: any;
  setValue: (key: string, val: any) => void;
  patch: (patch: Record<string, any>) => void;
}

export interface FieldHooks {
  onInit?: (ctx: FieldHookCtx) => void | Promise<void>;
  onChange?: (value: any, ctx: FieldHookCtx) => void | Promise<void>;
  onBlur?: (value: any, ctx: FieldHookCtx) => void | Promise<void>;
}

export type FieldWidth = 'full' | 'half' | 'third' | 'quarter' | number;

/**
 * Hint dinamico: recibe el form, el control y el valor actual, y devuelve la
 * cadena a mostrar (o null/undefined para ocultar). Se evalua junto con las
 * recomputaciones de visibilidad/required, asi que reacciona a cualquier
 * cambio del form.
 */
export type HintFn = (ctx: {
  form: FormGroup;
  control: AbstractControl;
  value: any;
}) => string | null | undefined;

export interface BaseFieldConfig {
  key: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  /** Texto de ayuda. Estatico (string) o derivado del estado del form (funcion). */
  hint?: string | HintFn;
  defaultValue?: any;
  disabled?: boolean;
  readonly?: boolean;
  width?: FieldWidth;        // Within a grid row
  validators?: FieldValidator[];
  visibleWhen?: (form: FormGroup) => boolean;
  disabledWhen?: (form: FormGroup) => boolean;
  requiredWhen?: (form: FormGroup) => boolean;
  hooks?: FieldHooks;
  meta?: Record<string, unknown>;
  customComponent?: Type<any>;
  /** For select/radio/check */
  options?: OptionsSource;
  /** Multi-selection toggle for checkbox-group / radio (default false for radio, true for checkbox-group) */
  multiple?: boolean;

  // ---- Decoradores opcionales del label ----
  /** Nombre de icono Lucide (kebab-case) que se renderiza junto al label. Ver `icon-resolver`. */
  icon?: string;
  /** Texto del tooltip mostrado al hacer hover en un signo de pregunta junto al label. */
  tooltip?: string;
  /** Variante visual del tooltip. */
  tooltipVariant?: 'info' | 'warning' | 'error';
  /**
   * Mascara estilo `ngx-mask` (ej. `'0000-0000'`). Solo se aplica si la dependencia
   * `ngx-mask` esta instalada y registrada en la app — sin ella el campo se renderiza
   * sin mascara y se ignora silenciosamente.
   */
  mask?: string;
}

export interface FormSchema {
  fields: BaseFieldConfig[];
  layout?: 'stack' | 'grid';
  cols?: number;             // default grid columns
  submit?: { label?: string; show?: boolean };
}

export type FieldConfig = BaseFieldConfig;
