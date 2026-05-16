import { Component } from '@angular/core';
import { ComingSoonComponent } from './coming-soon.component';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stubs.tenants.html',
})
export class AdminTenantsComponent {}

@Component({
  selector: 'app-admin-invitations',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stubs.invitations.html',
})
export class AdminInvitationsComponent {}

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stubs.audit.html',
})
export class AdminAuditComponent {}
