import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Compensation, CompensationDraft } from './finance.model';

const path = (p: string) => ms(MICROSERVICES.FINANCE, p);

/**
 * Compensaciones por nivel (finance-service). `current` devuelve null cuando el
 * nivel no tiene configuración vigente — la vista usa ese null para PRECARGAR
 * la del nivel superior (regla de cascada). Guardar en un nivel = `create` si
 * no tenía vigente, `supersede` si sí (histórico con ValidFrom/ValidTo).
 */
@Injectable({ providedIn: 'root' })
export class FinanceApi {
  private readonly api = inject(ApiService);

  // ---- Empresa ----
  businessCurrent(businessId: string): Observable<Compensation | null> {
    return this.api.get<Compensation | null>(path('business-compensations/current'), { businessId })
      .pipe(map(c => c ?? null), catchError(() => of(null)));
  }
  businessCreate(businessId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.post(path('business-compensations'), { businessId, ...d });
  }
  businessSupersede(id: string, businessId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.put(path(`business-compensations/${id}/supersede`), { businessId, ...d });
  }

  // ---- Sede ----
  branchCurrent(branchId: string): Observable<Compensation | null> {
    return this.api.get<Compensation | null>(path('branch-compensations/current'), { branchId })
      .pipe(map(c => c ?? null), catchError(() => of(null)));
  }
  branchCreate(branchId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.post(path('branch-compensations'), { branchId, ...d });
  }
  branchSupersede(id: string, branchId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.put(path(`branch-compensations/${id}/supersede`), { branchId, ...d });
  }

  // ---- Empleado ----
  employeeCurrent(employeeId: string): Observable<Compensation | null> {
    return this.api.get<Compensation | null>(path('employee-compensations/current'), { employeeId })
      .pipe(map(c => c ?? null), catchError(() => of(null)));
  }
  employeeCreate(employeeId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.post(path('employee-compensations'), { employeeId, ...d });
  }
  employeeSupersede(id: string, employeeId: string, d: CompensationDraft): Observable<Compensation> {
    return this.api.put(path(`employee-compensations/${id}/supersede`), { employeeId, ...d });
  }
}
