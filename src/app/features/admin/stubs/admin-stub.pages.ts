import { Component } from '@angular/core';
import { ComingSoonComponent } from './coming-soon.component';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon
    title="Empresas"
    subtitle="Tenants registrados en la plataforma."
    description="Gestión de empresas, planes y límites. El backend para esta sección está en desarrollo." />`,
})
export class AdminTenantsPage {}

@Component({
  selector: 'app-admin-invitations',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon
    title="Invitaciones"
    subtitle="Invitaciones enviadas a nuevos usuarios."
    description="Aquí podrás reenviar, revocar y crear invitaciones. Pendiente de endpoint en el backend." />`,
})
export class AdminInvitationsPage {}

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon
    title="Auditoría"
    subtitle="Bitácora de eventos del sistema."
    description="Historial filtrable de acciones por usuario, módulo y rango de fechas. Pendiente de endpoint." />`,
})
export class AdminAuditPage {}
