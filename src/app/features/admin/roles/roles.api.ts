import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

export interface Role { id: string; code: string; name: string; description?: string; enabled: boolean; }

@Injectable({ providedIn: 'root' })
export class RolesApi {
  private readonly api = inject(ApiService);
  list(): Observable<Role[]> { return this.api.get(path('roles')); }
  get(id: string): Observable<Role> { return this.api.get(path(`roles/${id}`)); }
  create(p: Partial<Role>): Observable<Role> { return this.api.post(path('roles'), p); }
  update(id: string, p: Partial<Role>): Observable<Role> { return this.api.put(path(`roles/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`roles/${id}`)); }
  permissions(id: string): Observable<{ id: string; code: string; name: string }[]> { return this.api.get(path(`roles/${id}/permissions`)); }
  setPermissions(id: string, permissionIds: string[]): Observable<void> { return this.api.put(path(`roles/${id}/permissions`), { ids: permissionIds }); }
}
