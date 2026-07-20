import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { EmployeeBalance, Settlement, SettlementDraft } from './settlement.model';

const finance = (p: string) => ms(MICROSERVICES.FINANCE, p);
const elastic = (p: string) => ms(MICROSERVICES.ELASTIC, p);

/**
 * Liquidaciones. Las LECTURAS de saldo van por Elasticsearch (read model) para
 * no pegarle a la BD transaccional en cada carga del listado; la ESCRITURA
 * (confirmar) va contra finance-service, la fuente de verdad que mueve el saldo.
 */
@Injectable({ providedIn: 'root' })
export class SettlementApi {
  private readonly api = inject(ApiService);

  /** Saldos del negocio (opcionalmente de una sede) desde el read model. */
  balances(businessId: string, branchId?: string | null): Observable<EmployeeBalance[]> {
    const params = branchId ? { branchId } : {};
    return this.api.get<EmployeeBalance[]>(elastic(`balances/by-business/${businessId}`), params)
      .pipe(catchError(() => of([])));
  }

  /** Confirma la liquidación. Irreversible: mueve dinero al saldo del empleado. */
  settle(d: SettlementDraft): Observable<Settlement> {
    return this.api.post(finance('settlements'), d);
  }

  /** Historial de liquidaciones del negocio (auditoría). */
  history(businessId: string): Observable<Settlement[]> {
    return this.api.get<Settlement[]>(finance('settlements'), { businessId })
      .pipe(catchError(() => of([])));
  }
}
