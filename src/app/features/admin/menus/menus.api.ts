import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

export interface MenuNode {
  id: string;
  code: string;
  name: string;
  icon?: string;
  route?: string | null;
  parentId?: string | null;
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
  children: MenuNode[];
}

export interface MenuPayload {
  code: string;
  name: string;
  icon?: string;
  route?: string | null;
  parentId?: string | null;
  displayOrder: number;
}

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
