import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  enabled: boolean;
  roles: { id: string; code: string; name: string }[];
}

export interface CreateUserPayload {
  email: string;
  fullName?: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  fullName?: string;
  enabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly api = inject(ApiService);
  list(): Observable<AdminUser[]>            { return this.api.get('users'); }
  get(id: string): Observable<AdminUser>     { return this.api.get(`users/${id}`); }
  create(p: CreateUserPayload): Observable<AdminUser> { return this.api.post('users', p); }
  update(id: string, p: UpdateUserPayload): Observable<AdminUser> { return this.api.put(`users/${id}`, p); }
  remove(id: string): Observable<void>       { return this.api.delete(`users/${id}`); }
  assignRoles(id: string, roleIds: string[]): Observable<void> { return this.api.post(`users/${id}/roles`, { roleIds }); }
}
