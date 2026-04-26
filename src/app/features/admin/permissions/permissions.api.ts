import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

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

  list(): Observable<Permission[]>                    { return this.api.get('permissions'); }
  get(id: string): Observable<Permission>             { return this.api.get(`permissions/${id}`); }
  create(p: Partial<Permission>): Observable<Permission> { return this.api.post('permissions', p); }
  update(id: string, p: Partial<Permission>): Observable<Permission> { return this.api.put(`permissions/${id}`, p); }
  remove(id: string): Observable<void>                { return this.api.delete(`permissions/${id}`); }
}
