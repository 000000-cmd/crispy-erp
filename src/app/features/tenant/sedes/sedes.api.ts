import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Branch, BranchPayload } from './sedes.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

@Injectable({ providedIn: 'root' })
export class SedesApi {
  private readonly api = inject(ApiService);

  list(businessId: string): Observable<Branch[]> { return this.api.get(path('branches'), { businessId }); }
  create(p: BranchPayload): Observable<Branch> { return this.api.post(path('branches'), p); }
  update(id: string, p: Partial<BranchPayload>): Observable<Branch> { return this.api.put(path(`branches/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`branches/${id}`)); }
}
