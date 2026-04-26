import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

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

  tree(): Observable<MenuNode[]>                  { return this.api.get('menus/tree'); }
  flat(): Observable<MenuNode[]>                  { return this.api.get('menus'); }
  get(id: string): Observable<MenuNode>           { return this.api.get(`menus/${id}`); }
  create(p: MenuPayload): Observable<MenuNode>    { return this.api.post('menus', p); }
  update(id: string, p: MenuPayload): Observable<MenuNode> { return this.api.put(`menus/${id}`, p); }
  remove(id: string): Observable<void>            { return this.api.delete(`menus/${id}`); }
  rolesOf(id: string): Observable<string[]>       { return this.api.get(`menus/${id}/roles`); }
  setRoles(id: string, ids: string[]): Observable<void> { return this.api.put(`menus/${id}/roles`, { ids }); }
}
