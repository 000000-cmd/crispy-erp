import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { switchMap, tap } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
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
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, TPipe],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent {
  private readonly api = inject(UsersApi);
  private readonly rolesApi = inject(RolesApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<Partial<AdminUser> | null>(null);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly schema = computed(() => {
    const e = this.editing();
    if (!e) return null;
    const s = buildUserSchema(this.rolesApi, e.id ? 'edit' : 'create');
    return { ...s, submit: { ...(s.submit ?? {}), show: false } };
  });

  readonly columns = computed<ColumnDef<AdminUser>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'username', label: this.i18n.t('admin.users.column.user'), width: '160px' },
      { key: 'fullName' as any, label: this.i18n.t('admin.users.column.name'), format: r => r.fullName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—' },
      { key: 'email',    label: this.i18n.t('admin.users.column.email') },
      { key: 'roles' as any, label: this.i18n.t('admin.users.column.roles'), format: r => r.roles?.map(x => x.name).join(', ') || r.roleCodes?.join(', ') || '—' },
      { key: 'enabled' as any, label: this.i18n.t('admin.users.column.status'), align: 'center', format: r => r.enabled ? this.i18n.t('common.active') : this.i18n.t('common.inactive') },
    ];
  });

  readonly actions = computed<RowAction<AdminUser>[]>(() => {
    void this.i18n.dict();
    return [
      { icon: Pencil, label: this.i18n.t('common.edit'),  tone: 'primary', onClick: r => this.openEdit(r) },
      { icon: Trash2, label: this.i18n.t('common.delete'), tone: 'danger', onClick: r => this.askDelete(r) },
    ];
  });

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.dirty.set(false);
    this.editing.set({ theme: 'light', languageCode: 'es-CO', roles: [] } as any);
  }

  openEdit(u: AdminUser) {
    this.dirty.set(false);
    // El back devuelve `roleCodes`, no roleIds. Mapeamos via la lista de roles.
    this.rolesApi.list().subscribe(allRoles => {
      const codes = new Set(u.roleCodes ?? []);
      const roleIds = allRoles.filter(r => codes.has(r.code)).map(r => r.id);
      this.editing.set({ ...u, roleIds } as any);
    });
  }

  close() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(value: any) {
    const editing = this.editing();
    if (!editing) return;
    this.saving.set(true);

    if (!editing.id) {
      this.api.create({
        username: value.username,
        email: value.email,
        password: value.password,
        firstName: value.firstName,
        lastName: value.lastName,
        theme: value.theme,
        languageCode: value.languageCode,
        roleIds: value.roleIds ?? [],
      }).subscribe({
        next: () => { this.toast.success(this.i18n.t('admin.users.toast.created')); this.saving.set(false); this.close(); this.refresh(); },
        error: () => this.saving.set(false),
      });
    } else {
      this.api.update(editing.id, {
        firstName: value.firstName,
        lastName: value.lastName,
        theme: value.theme,
        languageCode: value.languageCode,
      }).pipe(
        switchMap(() => this.api.assignRoles(editing.id!, value.roleIds ?? [])),
        tap(() => this.toast.success(this.i18n.t('admin.users.toast.saved'))),
      ).subscribe({
        next: () => { this.saving.set(false); this.close(); this.refresh(); },
        error: () => this.saving.set(false),
      });
    }
  }

  async askDelete(u: AdminUser) {
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.users.delete.title'),
      message: this.i18n.t('admin.users.delete.message', { email: u.email }),
      confirmText: this.i18n.t('common.delete'),
      tone: 'danger',
    });
    if (!ok) return;
    this.api.remove(u.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.users.toast.deleted')); this.refresh(); },
    });
  }
}
