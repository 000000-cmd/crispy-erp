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

  /** Búsqueda paginada vía Elasticsearch (GET principal + buscador). */
  search(params: { q?: string; enabled?: boolean; page?: number; size?: number; sort?: string }): Observable<SearchResponse<ThirdParty>> {
    return this.api.get(ms(MICROSERVICES.ELASTIC, 'third-parties'), { ...params });
  }

  /** Documento del tercero ALMACENADO en Elasticsearch (lado izquierdo del comparador). */
  searchDoc(id: string): Observable<Record<string, unknown>> {
    return this.api.get(ms(MICROSERVICES.ELASTIC, `third-parties/${id}`));
  }

  /** Proyección de la fuente al read-model de ES: lo que el índice DEBERÍA tener. */
  indexPreview(id: string): Observable<Record<string, unknown>> {
    return this.api.get(path(`third-parties/${id}/full`));
  }

  /** Fuerza un reindex completo del tercero (datos + contactos + direcciones). */
  reindex(id: string): Observable<void> {
    return this.api.post(path(`third-parties/${id}/reindex`));
  }

  // ---- Tercero ----
  list(): Observable<ThirdParty[]> { return this.api.get(path('third-parties')); }
  get(id: string): Observable<ThirdParty> { return this.api.get(path(`third-parties/${id}`)); }

  /** Info COMPLETA y anidada (tercero + contactos + direcciones). */
  getFull(id: string): Observable<ThirdPartyDetail> { return this.api.get(path(`third-parties/${id}/full`)); }

  create(payload: ThirdPartyPayload): Observable<ThirdParty> { return this.api.post(path('third-parties'), payload); }
  update(id: string, payload: Partial<ThirdPartyPayload>): Observable<ThirdParty> { return this.api.put(path(`third-parties/${id}`), payload); }
  remove(id: string): Observable<void> { return this.api.delete(path(`third-parties/${id}`)); }

  existsDocument(documentTypeId: string, documentNumber: string): Observable<boolean> {
    return this.api.get(path('third-parties/document/exists'), { documentTypeId, documentNumber });
  }
  findByDocument(documentTypeId: string, documentNumber: string): Observable<ThirdParty> {
    return this.api.get(path('third-parties/document'), { documentTypeId, documentNumber });
  }

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
