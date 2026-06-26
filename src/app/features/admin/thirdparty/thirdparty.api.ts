import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

const path = (p: string) => ms(MICROSERVICES.THIRDPARTY, p);

export interface ThirdParty {

  id: string;

  type: 'PERSON' | 'COMPANY';

  documentTypeId: string;

  /**
   * Opcional.
   * El backend puede enriquecer el DTO en el futuro.
   */
  documentTypeName?: string;

  documentNumber: string;

  /**
   * Relación opcional con Auth.
   */
  userId?: string | null;

  firstName?: string;

  secondName?: string;

  firstLastName?: string;

  secondLastName?: string;

  businessName?: string;

  tradeName?: string;

  email?: string;

  phone?: string;

  active: boolean;

  enabled?: boolean;

  visible?: boolean;

  /**
   * Campo únicamente para la tabla.
   */
  fullName?: string;
}

export interface CreateThirdPartyPayload {

  type: 'PERSON' | 'COMPANY';

  documentTypeId: string;

  documentNumber: string;

  firstName?: string;

  secondName?: string;

  firstLastName?: string;

  secondLastName?: string;

  businessName?: string;

  tradeName?: string;

  email?: string;

  phone?: string;

  active: boolean;
}

export interface UpdateThirdPartyPayload {

  type?: 'PERSON' | 'COMPANY';

  documentTypeId?: string;

  documentNumber?: string;

  firstName?: string;

  secondName?: string;

  firstLastName?: string;

  secondLastName?: string;

  businessName?: string;

  tradeName?: string;

  email?: string;

  phone?: string;

  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyApi {

  private readonly api = inject(ApiService);

  list(): Observable<ThirdParty[]> {
    return this.api.get(path('third-parties'));
  }

  get(id: string): Observable<ThirdParty> {
    return this.api.get(path(`third-parties/${id}`));
  }

  create(payload: CreateThirdPartyPayload): Observable<ThirdParty> {
    return this.api.post(path('third-parties'), payload);
  }

  update(
    id: string,
    payload: UpdateThirdPartyPayload
  ): Observable<ThirdParty> {
    return this.api.put(path(`third-parties/${id}`), payload);
  }

  remove(id: string): Observable<void> {
    return this.api.delete(path(`third-parties/${id}`));
  }

  existsDocument(
    documentNumber: string
  ): Observable<boolean> {
    return this.api.get(
      path(`third-parties/exists-document/${encodeURIComponent(documentNumber)}`)
    );
  }
}