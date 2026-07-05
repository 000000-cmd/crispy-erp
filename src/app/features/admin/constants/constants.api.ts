import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Constant } from './constants.model';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

@Injectable({ providedIn: 'root' })
export class ConstantsApi {
  private readonly api = inject(ApiService);
  list(): Observable<Constant[]> { return this.api.get(path('constants')); }
  create(p: Partial<Constant>): Observable<Constant> { return this.api.post(path('constants'), p); }
  update(id: string, p: Partial<Constant>): Observable<Constant> { return this.api.put(path(`constants/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`constants/${id}`)); }
}
