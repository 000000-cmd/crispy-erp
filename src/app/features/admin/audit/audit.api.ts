import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE';

export interface AuditLog {
  id: string;
  action: AuditAction;
  aggregateType: string;
  aggregateId?: string;
  businessId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  occurredAt: string;
  before?: any;
  after?: any;
  changedFields?: string[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuditFilters {
  businessId?: string;
  aggregateType?: string;
  aggregateId?: string;
  actorId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private readonly api = inject(ApiService);

  list(filters: AuditFilters): Observable<PagedResponse<AuditLog>> {
    return this.api.get(ms(MICROSERVICES.AUDIT, 'audit'), { ...filters });
  }
}
