import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../http/api.service';
import { MICROSERVICES, ms } from '../http/microservices';
import { MenuNode } from './menu.model';

@Injectable({ providedIn: 'root' })
export class MenusApi {
  private readonly api = inject(ApiService);

  /** Arbol de menus visibles para el usuario actual (segun roles). */
  myTree(): Observable<MenuNode[]> { return this.api.get(ms(MICROSERVICES.SYSTEM, 'menus/me')); }

  /** Arbol completo (admin). */
  fullTree(): Observable<MenuNode[]> { return this.api.get(ms(MICROSERVICES.SYSTEM, 'menus/tree')); }
}
