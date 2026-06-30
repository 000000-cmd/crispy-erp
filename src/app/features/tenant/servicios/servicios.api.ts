import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { Offering, OfferingPayload } from './servicios.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

@Injectable({ providedIn: 'root' })
export class ServiciosApi {
  private readonly api = inject(ApiService);

  list(businessId: string): Observable<Offering[]> { return this.api.get(path('offerings'), { businessId }); }
  create(p: OfferingPayload): Observable<Offering> { return this.api.post(path('offerings'), p); }
  update(id: string, p: Partial<OfferingPayload>): Observable<Offering> { return this.api.put(path(`offerings/${id}`), p); }
  remove(id: string): Observable<void> { return this.api.delete(path(`offerings/${id}`)); }
}
