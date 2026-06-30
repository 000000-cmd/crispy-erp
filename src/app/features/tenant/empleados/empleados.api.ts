import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { EmployeeDetail, EmployeePayload } from './empleados.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

@Injectable({ providedIn: 'root' })
export class EmpleadosApi {
  private readonly api = inject(ApiService);

  listDetailed(branchId: string): Observable<EmployeeDetail[]> {
    return this.api.get(path('employees/detailed'), { branchId });
  }
  create(p: EmployeePayload): Observable<EmployeeDetail> { return this.api.post(path('employees'), p); }
  update(id: string, p: Partial<EmployeePayload>): Observable<EmployeeDetail> { return this.api.put(path(`employees/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`employees/${id}`)); }
}
