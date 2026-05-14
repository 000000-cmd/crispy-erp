import { Component } from '@angular/core';
import { AdminProfilePage } from '../../admin/profile/profile.page';

// Mismo contenido que admin/profile por ahora; se puede divergir cuando se necesite.
@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [AdminProfilePage],
  templateUrl: './profile.page.html',
})
export class TenantProfilePage {}
