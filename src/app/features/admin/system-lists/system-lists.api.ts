import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

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

  lists(): Observable<SystemList[]>                   { return this.api.get('system-lists'); }
  list(id: string): Observable<SystemList>            { return this.api.get(`system-lists/${id}`); }
  createList(p: Partial<SystemList>): Observable<SystemList> { return this.api.post('system-lists', p); }
  updateList(id: string, p: Partial<SystemList>): Observable<SystemList> { return this.api.put(`system-lists/${id}`, p); }
  deleteList(id: string): Observable<void>            { return this.api.delete(`system-lists/${id}`); }

  items(listId: string): Observable<SystemListItem[]> { return this.api.get(`system-lists/${listId}/items`); }
  createItem(listId: string, p: Partial<SystemListItem>): Observable<SystemListItem> { return this.api.post(`system-lists/${listId}/items`, p); }
  updateItem(listId: string, id: string, p: Partial<SystemListItem>): Observable<SystemListItem> { return this.api.put(`system-lists/${listId}/items/${id}`, p); }
  deleteItem(listId: string, id: string): Observable<void> { return this.api.delete(`system-lists/${listId}/items/${id}`); }
}
