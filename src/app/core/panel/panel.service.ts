import { Injectable, inject } from '@angular/core';
import { PanelApi } from './panel.api';
import { MICROSERVICES } from '../http/microservices';

@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly panel = inject(PanelApi);

  systemStatus() {
    return this.panel.health(MICROSERVICES.SYSTEM);
  }

  authStatus() {
    return this.panel.health(MICROSERVICES.AUTH);
  }

  searchStatus() {
    return this.panel.health(MICROSERVICES.ELASTIC);
  }

  auditStatus() {
    return this.panel.health(MICROSERVICES.AUDIT);
  }

  businessStatus() {
    return this.panel.health(MICROSERVICES.BUSINESS);
  }
}
