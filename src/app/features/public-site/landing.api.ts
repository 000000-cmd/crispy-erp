import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiService } from '../../core/http/api.service';
import { ApiResponse } from '../../core/http/api-response';
import { MICROSERVICES, ms } from '../../core/http/microservices';
import { BusinessLanding, BusinessLandingPayload, PublicLanding } from './landing.model';

const path = (p: string) => ms(MICROSERVICES.BUSINESS, p);

@Injectable({ providedIn: 'root' })
export class LandingApi {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  /** Página pública agregada por slug (sin JWT). null si no existe/no publicada. */
  publicLanding(slug: string): Observable<PublicLanding | null> {
    return this.api.get<PublicLanding | null>(path('public/landing'), { slug }).pipe(map(v => v ?? null));
  }

  /** Landing del dueño (borrador o publicada). null si aún no la ha creado. */
  byBusiness(businessId: string): Observable<BusinessLanding | null> {
    return this.api.get<BusinessLanding | null>(path('landing'), { businessId }).pipe(map(v => v ?? null));
  }

  /** Upsert del documento completo (Guardar / Publicar). */
  upsert(businessId: string, payload: BusinessLandingPayload): Observable<BusinessLanding> {
    return this.api.put(path(`landing/${businessId}`), payload);
  }

  /** Sube una imagen (multipart) y devuelve su URL relativa al gateway. */
  uploadAsset(businessId: string, file: File): Observable<string> {
    const form = new FormData();
    form.append('businessId', businessId);
    form.append('file', file);
    return this.http.post<ApiResponse<{ url: string }>>(
      `${environment.apiUrl}/${path('landing/assets')}`, form,
    ).pipe(map(r => r.data.url));
  }
}
