import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

/**
 * Meta-registro de un catalogo (declara que existe). Corresponde a
 * {@code SystemListResponse} del back (`/system-lists`).
 */
export interface SystemList {
  id: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  visible: boolean;
}

export interface SystemListRequest {
  code: string;
  name: string;
  description?: string;
}

/**
 * Item dentro de un catalogo. Corresponde a {@code CatalogResponse} del back
 * (`/list/{catalogName}`). Cada catalogo tiene su propia tabla pero todos
 * comparten esta forma porque heredan de {@code BaseCatalogDomain}.
 */
export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  value?: string;
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
}

export interface CatalogRequest {
  code: string;
  name: string;
  value?: string;
  displayOrder: number;
}

/**
 * Consumo unificado del subsistema de listas de catalogo del back:
 *  - {@code /system-lists}: meta-registro (que catalogos existen).
 *  - {@code /list/{name}}:  items de un catalogo concreto.
 *
 * El back hace este split tras el refactor de catalogos (CatalogController +
 * CatalogRegistry); en el front lo expone un unico servicio para no fragmentar.
 */
@Injectable({ providedIn: 'root' })
export class SystemListsApi {
  private readonly api = inject(ApiService);

  // ---- /system-lists (meta) ----
  lists(): Observable<SystemList[]>                                   { return this.api.get(path('system-lists')); }
  get(id: string): Observable<SystemList>                             { return this.api.get(path(`system-lists/${id}`)); }
  create(body: SystemListRequest): Observable<SystemList>             { return this.api.post(path('system-lists'), body); }
  update(id: string, body: SystemListRequest): Observable<SystemList> { return this.api.put(path(`system-lists/${id}`), body); }
  delete(id: string): Observable<void>                                { return this.api.delete(path(`system-lists/${id}`)); }

  // ---- /list/{catalogName} (items) ----
  items(catalogName: string): Observable<CatalogItem[]>                                  { return this.api.get(path(`list/${catalogName}`)); }
  itemsEnabled(catalogName: string): Observable<CatalogItem[]>                           { return this.api.get(path(`list/${catalogName}/enabled`)); }
  itemById(catalogName: string, id: string): Observable<CatalogItem>                     { return this.api.get(path(`list/${catalogName}/${id}`)); }
  createItem(catalogName: string, body: CatalogRequest): Observable<CatalogItem>         { return this.api.post(path(`list/${catalogName}`), body); }
  updateItem(catalogName: string, id: string, body: CatalogRequest): Observable<CatalogItem> { return this.api.put(path(`list/${catalogName}/${id}`), body); }
  deleteItem(catalogName: string, id: string): Observable<void>                          { return this.api.delete(path(`list/${catalogName}/${id}`)); }
  toggleItemEnabled(catalogName: string, id: string, enabled: boolean): Observable<void> { return this.api.patch(path(`list/${catalogName}/${id}/enabled?value=${enabled}`)); }
}
