import { InjectionToken, Type } from '@angular/core';
import { FieldType } from './types';

export interface FieldComponentInputs {
  field: any;          // FieldConfig
  control: any;        // AbstractControl
  options?: any[];     // resolved options (for select/radio/etc)
}

export const FIELD_REGISTRY = new InjectionToken<Record<FieldType, Type<any>>>('FIELD_REGISTRY');
