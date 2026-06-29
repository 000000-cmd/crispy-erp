import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Business, BusinessDomain, BusinessDomainPayload, BusinessPayload, ProvisionRequest, ProvisionResponse } from './business.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

@Injectable({ providedIn: 'root' })
export class BusinessApi {
  private readonly api = inject(ApiService);

  /** Aprovisiona un negocio completo (empresa + slug + persona dueño + business_owner). */
  provision(p: ProvisionRequest): Observable<ProvisionResponse> { return this.api.post(path('provision'), p); }

  // ---- Empresa ----
  list(): Observable<Business[]> { return this.api.get(path('businesses')); }
  get(id: string): Observable<Business> { return this.api.get(path(`businesses/${id}`)); }
  create(p: BusinessPayload): Observable<Business> { return this.api.post(path('businesses'), p); }
  update(id: string, p: Partial<BusinessPayload>): Observable<Business> { return this.api.put(path(`businesses/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`businesses/${id}`)); }

  // ---- Dominios/slug de la empresa ----
  listDomains(businessId: string): Observable<BusinessDomain[]> {
    return this.api.get(path('business-domains'), { businessId });
  }
  createDomain(p: BusinessDomainPayload): Observable<BusinessDomain> { return this.api.post(path('business-domains'), p); }
  updateDomain(id: string, p: Partial<BusinessDomainPayload>): Observable<BusinessDomain> { return this.api.put(path(`business-domains/${id}`), p); }
  removeDomain(id: string): Observable<void> { return this.api.delete(path(`business-domains/${id}`)); }
}
