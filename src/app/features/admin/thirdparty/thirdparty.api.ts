import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { SearchResponse } from '../../../core/http/search';
import {
  ThirdParty,
  ThirdPartyAddress,
  ThirdPartyAddressPayload,
  ThirdPartyContact,
  ThirdPartyContactPayload,
  ThirdPartyDetail,
  ThirdPartyPayload,
} from './thirdparty.model';

const path = (p: string) => ms(MICROSERVICES.THIRDPARTY, p);

@Injectable({ providedIn: 'root' })
export class ThirdPartyApi {
  private readonly api = inject(ApiService);

  /**
   * Búsqueda paginada vía Elasticsearch. Los filtros/paginación van por el CUERPO
   * (POST) — no por query params — para peticiones más limpias.
   */
  search(params: { q?: string; enabled?: boolean; page?: number; size?: number; sort?: string }): Observable<SearchResponse<ThirdParty>> {
    return this.api.post(ms(MICROSERVICES.ELASTIC, 'third-parties'), { ...params });
  }

  /**
   * Documento COMPLETO almacenado en Elasticsearch (base + contactos + direcciones).
   * Lado "ES" del comparador de reindex; se contrasta contra {@link getFull} (BD).
   */
  searchDoc(id: string): Observable<Record<string, unknown>> {
    return this.api.get(ms(MICROSERVICES.ELASTIC, `third-parties/${id}`));
  }

  /** Fuerza un reindex completo del tercero (datos + contactos + direcciones). */
  reindex(id: string): Observable<void> {
    return this.api.post(path(`third-parties/${id}/reindex`));
  }

  // ---- Tercero ----
  // El listado general va SIEMPRE por Elasticsearch (search()); no se duplica
  // aqui un list() contra la BD.
  get(id: string): Observable<ThirdParty> { return this.api.get(path(`third-parties/${id}`)); }

  /** Info COMPLETA y anidada (tercero + contactos + direcciones). */
  getFull(id: string): Observable<ThirdPartyDetail> { return this.api.get(path(`third-parties/${id}/full`)); }

  create(payload: ThirdPartyPayload): Observable<ThirdParty> { return this.api.post(path('third-parties'), payload); }
  update(id: string, payload: Partial<ThirdPartyPayload>): Observable<ThirdParty> { return this.api.put(path(`third-parties/${id}`), payload); }
  remove(id: string): Observable<void> { return this.api.delete(path(`third-parties/${id}`)); }

  // ---- Contactos (1:N) ----
  listContacts(thirdPartyId: string): Observable<ThirdPartyContact[]> {
    return this.api.get(path('third-party-contacts'), { thirdPartyId });
  }
  createContact(payload: ThirdPartyContactPayload): Observable<ThirdPartyContact> { return this.api.post(path('third-party-contacts'), payload); }
  updateContact(id: string, payload: Partial<ThirdPartyContactPayload>): Observable<ThirdPartyContact> { return this.api.put(path(`third-party-contacts/${id}`), payload); }
  removeContact(id: string): Observable<void> { return this.api.delete(path(`third-party-contacts/${id}`)); }

  // ---- Direcciones (1:N) ----
  listAddresses(thirdPartyId: string): Observable<ThirdPartyAddress[]> {
    return this.api.get(path('third-party-addresses'), { thirdPartyId });
  }
  createAddress(payload: ThirdPartyAddressPayload): Observable<ThirdPartyAddress> { return this.api.post(path('third-party-addresses'), payload); }
  updateAddress(id: string, payload: Partial<ThirdPartyAddressPayload>): Observable<ThirdPartyAddress> { return this.api.put(path(`third-party-addresses/${id}`), payload); }
  removeAddress(id: string): Observable<void> { return this.api.delete(path(`third-party-addresses/${id}`)); }
}

export type {
  ThirdParty, ThirdPartyContact, ThirdPartyAddress, ThirdPartyDetail,
  ThirdPartyPayload, ThirdPartyContactPayload, ThirdPartyAddressPayload,
} from './thirdparty.model';
