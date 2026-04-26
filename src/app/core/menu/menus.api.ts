import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../http/api.service';

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

@Injectable({ providedIn: 'root' })
export class MenusApi {
  private readonly api = inject(ApiService);

  /** Arbol de menus visibles para el usuario actual (segun roles). */
  myTree(): Observable<MenuNode[]> { return this.api.get('menus/me'); }

  /** Arbol completo (admin). */
  fullTree(): Observable<MenuNode[]> { return this.api.get('menus/tree'); }
}
