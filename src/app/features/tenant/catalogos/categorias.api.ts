import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { OfferingCategory, CatalogPayload } from './catalog.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

/** Catálogo de categorías de servicios del negocio (per-business). */
@Injectable({ providedIn: 'root' })
export class CategoriasApi {
  private readonly api = inject(ApiService);

  list(businessId: string): Observable<OfferingCategory[]> { return this.api.get(path('offering-categories'), { businessId }); }
  create(p: CatalogPayload): Observable<OfferingCategory> { return this.api.post(path('offering-categories'), p); }
  update(id: string, p: Partial<CatalogPayload>): Observable<OfferingCategory> { return this.api.put(path(`offering-categories/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`offering-categories/${id}`)); }
}
