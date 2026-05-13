import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import { Microservice, ms } from '../http/microservices';

export type ServiceStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

export interface DependencyStatus {
  name: string;
  type: 'DB' | 'KAFKA' | 'EUREKA' | 'REDIS' | 'ELASTIC' | 'OTHER';
  status: ServiceStatus;
  detail?: string;
}

export interface ServiceInfo {
  serviceName: string;
  version: string;
  environment: string;
  status: ServiceStatus;
  javaVersion: string;
  springBootVersion: string;
  timestamp: string;
  uptimeMillis: number;
  buildTime?: string;
  dependencies?: DependencyStatus[];
  additionalInfo?: Record<string, string>;
}

export interface ServiceHealth {
  status: ServiceStatus;
  info?: ServiceInfo;
}

@Injectable({ providedIn: 'root' })
export class PanelApi {
  private readonly api = inject(ApiService);

  health(microService: Microservice): Observable<ServiceHealth> {
    return this.api.get<ServiceInfo>(ms(microService, 'api/info')).pipe(
      map(info => ({ status: (info.status ?? 'UP') as ServiceStatus, info })),
      catchError(() => of({ status: 'DOWN' as ServiceStatus })),
    );
  }
}
