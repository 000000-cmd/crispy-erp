import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.AUTH, p);

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;          // computed por back
  profilePhoto?: string | null;
  theme?: string;
  languageCode?: string;
  enabled: boolean;
  visible?: boolean;
  roleCodes?: string[];
  // back devuelve roleCodes en /users/me; en listas viene como array de objetos
  roles?: { id: string; code: string; name: string }[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string | null;
  theme?: string;
  languageCode?: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string | null;
  theme?: string;
  languageCode?: string;
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
