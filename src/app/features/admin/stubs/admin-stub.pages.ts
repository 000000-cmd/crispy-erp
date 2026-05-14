import { Component } from '@angular/core';
import { ComingSoonComponent } from './coming-soon.component';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stub.pages.tenants.html',
})
export class AdminTenantsPage {}

@Component({
  selector: 'app-admin-invitations',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stub.pages.invitations.html',
})
export class AdminInvitationsPage {}

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './admin-stub.pages.audit.html',
})
export class AdminAuditPage {}
