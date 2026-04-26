import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface Constant {
  id: string;
  code: string;
  name: string;
  value: string;
  type?: string;
  description?: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConstantsApi {
  private readonly api = inject(ApiService);
  list(): Observable<Constant[]> { return this.api.get('constants'); }
  create(p: Partial<Constant>): Observable<Constant> { return this.api.post('constants', p); }
  update(id: string, p: Partial<Constant>): Observable<Constant> { return this.api.put(`constants/${id}`, p); }
  remove(id: string): Observable<void> { return this.api.delete(`constants/${id}`); }
}
