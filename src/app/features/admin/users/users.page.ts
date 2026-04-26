import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { switchMap, tap } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ColumnDef, DataTableComponent, RowAction } from '../../../shared/table/data-table.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { AdminUser, UsersApi } from './users.api';
import { RolesApi } from '../roles/roles.api';
import { buildUserSchema } from './user-form';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, ModalComponent, DataTableComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Usuarios</h1>
          <p class="text-sm text-text-muted">Cuentas con acceso al sistema y sus roles asignados.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="openCreate()">Nuevo usuario</app-button>
      </header>

      <app-data-table
        [columns]="columns"
        [rows]="users()"
        [actions]="actions"
        [loading]="loading()"
      />

      <app-modal
        [open]="!!editing()"
        [title]="editing()?.id ? 'Editar usuario' : 'Nuevo usuario'"
        size="lg"
        (onClose)="close()"
      >
        @if (schema()) {
          <app-dynamic-form
            [schema]="schema()!"
            [model]="editing()!"
            [submitting]="saving()"
            (submitValue)="onSubmit($event)"
          />
        }
      </app-modal>
    </div>
  `,
})
export class AdminUsersPage {
  private readonly api = inject(UsersApi);
  private readonly rolesApi = inject(RolesApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<Partial<AdminUser> | null>(null);

  readonly schema = computed(() => {
    const e = this.editing();
    if (!e) return null;
    return buildUserSchema(this.rolesApi, e.id ? 'edit' : 'create');
  });

  readonly columns: ColumnDef<AdminUser>[] = [
    { key: 'fullName', label: 'Nombre', format: r => r.fullName || '—' },
    { key: 'email',    label: 'Correo' },
    { key: 'roles' as any, label: 'Roles', format: r => r.roles?.map(x => x.name).join(', ') || '—' },
    { key: 'enabled' as any, label: 'Estado', align: 'center', format: r => r.enabled ? 'Activo' : 'Inactivo' },
  ];

  readonly actions: RowAction<AdminUser>[] = [
    { icon: Pencil, label: 'Editar',  tone: 'primary', onClick: r => this.openEdit(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ];

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set({ enabled: true, roles: [] } as any);
  }

  openEdit(u: AdminUser) {
    this.editing.set({
      ...u,
      roleIds: u.roles?.map(r => r.id) ?? [],
    } as any);
  }

  close() { this.editing.set(null); }

  onSubmit(value: any) {
    const editing = this.editing();
    if (!editing) return;
    this.saving.set(true);

    if (!editing.id) {
      this.api.create({
        email: value.email, fullName: value.fullName, password: value.password, roleIds: value.roleIds ?? [],
      }).subscribe({
        next: () => { this.toast.success('Usuario creado'); this.saving.set(false); this.close(); this.refresh(); },
        error: () => this.saving.set(false),
      });
    } else {
      this.api.update(editing.id, { fullName: value.fullName, enabled: value.enabled }).pipe(
        switchMap(() => this.api.assignRoles(editing.id!, value.roleIds ?? [])),
        tap(() => this.toast.success('Cambios guardados')),
      ).subscribe({
        next: () => { this.saving.set(false); this.close(); this.refresh(); },
        error: () => this.saving.set(false),
      });
    }
  }

  async askDelete(u: AdminUser) {
    const ok = await this.confirm.ask({
      title: 'Eliminar usuario',
      message: `¿Confirmas eliminar a ${u.email}? Esta acción es reversible solo desde la base de datos.`,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    this.api.remove(u.id).subscribe({
      next: () => { this.toast.success('Usuario eliminado'); this.refresh(); },
    });
  }
}
