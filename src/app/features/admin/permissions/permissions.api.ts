import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  visible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionsApi {
  private readonly api = inject(ApiService);

  list(): Observable<Permission[]>                    { return this.api.get(path('permissions')); }
  get(id: string): Observable<Permission>             { return this.api.get(path(`permissions/${id}`)); }
  create(p: Partial<Permission>): Observable<Permission> { return this.api.post(path('permissions'), p); }
  update(id: string, p: Partial<Permission>): Observable<Permission> { return this.api.put(path(`permissions/${id}`), p); }
  remove(id: string): Observable<void>                { return this.api.delete(path(`permissions/${id}`)); }
}
