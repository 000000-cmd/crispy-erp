import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.AUTH, p);

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
  list(): Observable<AdminUser[]>            { return this.api.get(path('users')); }
  get(id: string): Observable<AdminUser>     { return this.api.get(path(`users/${id}`)); }
  create(p: CreateUserPayload): Observable<AdminUser> { return this.api.post(path('users'), p); }
  update(id: string, p: UpdateUserPayload): Observable<AdminUser> { return this.api.put(path(`users/${id}`), p); }
  remove(id: string): Observable<void>       { return this.api.delete(path(`users/${id}`)); }
  assignRoles(id: string, roleIds: string[]): Observable<void> { return this.api.post(path(`users/${id}/roles`), { roleIds }); }
}
