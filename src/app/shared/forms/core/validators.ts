import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { FieldValidator, ValidatorBuiltin } from './types';

export function buildValidators(list: FieldValidator[] | undefined): ValidatorFn[] {
  if (!list?.length) return [];
  const out: ValidatorFn[] = [];
  for (const v of list) {
    if (v === 'required') { out.push(messaged(Validators.required, 'validation.required')); continue; }
    if (v === 'email')    { out.push(messaged(Validators.email, 'validation.email')); continue; }
    if (typeof v === 'function') { out.push(v); continue; }
    if ('async' in (v as any)) continue; // handled separately
    out.push(builtin(v as ValidatorBuiltin));
  }
  return out;
}

function builtin(v: ValidatorBuiltin): ValidatorFn {
  switch (v.kind) {
    case 'required':  return messaged(Validators.required, v.message || 'validation.required');
    case 'email':     return messaged(Validators.email, v.message || 'validation.email');
    case 'min':       return messaged(Validators.min(Number(v.value)), v.message || 'validation.min', { n: v.value });
    case 'max':       return messaged(Validators.max(Number(v.value)), v.message || 'validation.max', { n: v.value });
    case 'minLength': return messaged(Validators.minLength(Number(v.value)), v.message || 'validation.minLength', { n: v.value });
    case 'maxLength': return messaged(Validators.maxLength(Number(v.value)), v.message || 'validation.maxLength', { n: v.value });
    case 'pattern':   return messaged(Validators.pattern(v.value as any), v.message || 'validation.pattern');
  }
}

function messaged(fn: ValidatorFn, msg: string, params?: Record<string, any>): ValidatorFn {
  return (c: AbstractControl) => {
    const r = fn(c);
    if (!r) return null;
    const key = Object.keys(r)[0];
    return { [key]: { ...(typeof r[key] === 'object' ? r[key] : {}), message: msg, params } };
  };
}

export function firstErrorMessage(c: AbstractControl): { message: string; params?: Record<string, any> } | null {
  if (!c.errors) return null;
  const k = Object.keys(c.errors)[0];
  const e = c.errors[k];
  if (e && typeof e === 'object' && 'message' in e) return { message: e.message, params: e.params };
  return { message: `validation.${k}` };
}
