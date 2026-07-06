import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, first, map, of, shareReplay } from 'rxjs';
import { ApiService } from '../http/api.service';
import { MICROSERVICES, ms } from '../http/microservices';
import { Constant } from './constant.model';

/**
 * Consumo de constantes del sistema POR CÓDIGO (individual). Patrón único de la
 * app: cuando un lado necesita una constante, la pide por su código y decide
 * según su `value` — y si está **inhabilitada o no existe, se OMITE la condición**
 * (no se bloquea al usuario por una regla que no está activa).
 *
 * Ejemplo: la mayoría de edad se controla con la constante `MAYEDAD`
 * ({@link legalAgeValidator}); si está deshabilitada, el formulario no exige edad.
 */
@Injectable({ providedIn: 'root' })
export class ConstantsService {
  private readonly api = inject(ApiService);
  /** Cache por código durante la sesión (una petición por constante). */
  private readonly cache = new Map<string, Observable<Constant | null>>();

  /** Código sembrado de la constante de mayoría de edad. */
  static readonly LEGAL_AGE = 'MAYORIA_EDAD';

  /** La constante por código. `null` si no existe / error (404 → se omite la regla). */
  byCode(code: string): Observable<Constant | null> {
    let obs = this.cache.get(code);
    if (!obs) {
      obs = this.api.get<Constant>(ms(MICROSERVICES.SYSTEM, `constants/code/${code}`)).pipe(
        catchError(() => of(null)),
        shareReplay(1),
      );
      this.cache.set(code, obs);
    }
    return obs;
  }

  /** Fuerza recargar una constante (p. ej. tras editarla en el admin). */
  invalidate(code?: string): void {
    if (code) this.cache.delete(code); else this.cache.clear();
  }

  /** `value` SOLO si la constante existe y está habilitada; si no, `null` (regla inactiva). */
  activeValue(code: string): Observable<string | null> {
    return this.byCode(code).pipe(map(c => (c && c.enabled ? c.value : null)));
  }

  /** Igual que {@link activeValue} pero numérico; `null` si inactiva o no numérica. */
  activeNumber(code: string): Observable<number | null> {
    return this.activeValue(code).pipe(map(v => {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }));
  }

  /** `true` si la constante existe y está habilitada. */
  isActive(code: string): Observable<boolean> {
    return this.byCode(code).pipe(map(c => !!c && c.enabled));
  }

  /**
   * Validador async de mayoría de edad para un control de fecha. Lee `MAYEDAD`:
   * si está inhabilitada / no existe / no es numérica → NO valida (regla omitida).
   * Sin fecha tampoco valida (de eso se encarga `required` si aplica).
   */
  legalAgeValidator(code: string = ConstantsService.LEGAL_AGE): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = control.value;
      if (!value) return of(null);
      return this.activeNumber(code).pipe(
        map(min => {
          if (min == null) return null; // regla inactiva → se omite
          const age = ConstantsService.ageFromDate(value);
          return age != null && age >= min
            ? null
            : { legalAge: { message: 'validation.legalAge', params: { min } } };
        }),
        first(),
      );
    };
  }

  /** Edad en años cumplidos a partir de una fecha `YYYY-MM-DD` (o Date). */
  static ageFromDate(value: string | Date): number | null {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }
}
