import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Specialty, CatalogPayload } from './catalog.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

/** Catálogo de especialidades del negocio (per-business), espejo de categorías. */
@Injectable({ providedIn: 'root' })
export class SpecialtiesApi {
  private readonly api = inject(ApiService);

  list(businessId: string): Observable<Specialty[]> { return this.api.get(path('specialties'), { businessId }); }
  create(p: CatalogPayload): Observable<Specialty> { return this.api.post(path('specialties'), p); }
  update(id: string, p: Partial<CatalogPayload>): Observable<Specialty> { return this.api.put(path(`specialties/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`specialties/${id}`)); }
}
