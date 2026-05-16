import { Component } from '@angular/core';
import { AdminProfileComponent } from '../../admin/profile/profile.component';

// Mismo contenido que admin/profile por ahora; se puede divergir cuando se necesite.
@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [AdminProfileComponent],
  templateUrl: './profile.component.html',
})
export class TenantProfileComponent {}
