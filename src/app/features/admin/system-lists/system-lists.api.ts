import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

export interface SystemList {
  id: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  itemsCount?: number;
}

export interface SystemListItem {
  id: string;
  listId: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  ordering?: number;
}

@Injectable({ providedIn: 'root' })
export class SystemListsApi {
  private readonly api = inject(ApiService);

  lists(): Observable<SystemList[]>                   { return this.api.get(path('system-lists')); }
  list(id: string): Observable<SystemList>            { return this.api.get(path(`system-lists/${id}`)); }
  createList(p: Partial<SystemList>): Observable<SystemList> { return this.api.post(path('system-lists'), p); }
  updateList(id: string, p: Partial<SystemList>): Observable<SystemList> { return this.api.put(path(`system-lists/${id}`), p); }
  deleteList(id: string): Observable<void>            { return this.api.delete(path(`system-lists/${id}`)); }

  items(listId: string): Observable<SystemListItem[]> { return this.api.get(path(`system-lists/${listId}/items`)); }
  createItem(listId: string, p: Partial<SystemListItem>): Observable<SystemListItem> { return this.api.post(path(`system-lists/${listId}/items`), p); }
  updateItem(listId: string, id: string, p: Partial<SystemListItem>): Observable<SystemListItem> { return this.api.put(path(`system-lists/${listId}/items/${id}`), p); }
  deleteItem(listId: string, id: string): Observable<void> { return this.api.delete(path(`system-lists/${listId}/items/${id}`)); }
}
