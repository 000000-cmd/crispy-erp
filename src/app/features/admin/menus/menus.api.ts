import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { MenuNode, MenuPayload } from '../../../core/menu/menu.model';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

/** CRUD de menús + asignación a roles (administración del sistema). */
@Injectable({ providedIn: 'root' })
export class AdminMenusApi {
  private readonly api = inject(ApiService);

  tree(): Observable<MenuNode[]>                  { return this.api.get(path('menus/tree')); }
  flat(): Observable<MenuNode[]>                  { return this.api.get(path('menus')); }
  get(id: string): Observable<MenuNode>           { return this.api.get(path(`menus/${id}`)); }
  create(p: MenuPayload): Observable<MenuNode>    { return this.api.post(path('menus'), p); }
  update(id: string, p: MenuPayload): Observable<MenuNode> { return this.api.put(path(`menus/${id}`), p); }
  remove(id: string): Observable<void>            { return this.api.delete(path(`menus/${id}`)); }
  rolesOf(id: string): Observable<string[]>       { return this.api.get(path(`menus/${id}/roles`)); }
  setRoles(id: string, ids: string[]): Observable<void> { return this.api.put(path(`menus/${id}/roles`), { ids }); }
}
