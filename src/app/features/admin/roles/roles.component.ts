import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { ColumnDef, DataTableComponent, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { Role, RolesApi } from './roles.api';
import { Permission, PermissionsApi } from '../permissions/permissions.api';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CheckboxComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, SpinnerComponent, TPipe],
  templateUrl: './roles.component.html',
})
export class AdminRolesComponent {
  private readonly api = inject(RolesApi);
  private readonly permsApi = inject(PermissionsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Role> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  // Permissions assignment
  readonly permsFor = signal<Role | null>(null);
  readonly allPerms = signal<Permission[]>([]);
  readonly selected = signal<Set<string>>(new Set());
  readonly loadingPerms = signal(false);
  readonly savingPerms = signal(false);

  readonly columns = computed<ColumnDef<Role>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'code', label: this.i18n.t('common.code'), width: '180px' },
      { key: 'name', label: this.i18n.t('common.name') },
      { key: 'description' as any, label: this.i18n.t('common.description'), format: r => r.description ?? '—' },
      { key: 'enabled' as any, label: this.i18n.t('common.status'), align: 'center', format: r => r.enabled ? this.i18n.t('common.active') : this.i18n.t('common.inactive') },
    ];
  });

  readonly actions = computed<RowAction<Role>[]>(() => {
    void this.i18n.dict();
    return [
      { icon: ShieldCheck, label: this.i18n.t('admin.permissions'), tone: 'primary', onClick: r => this.openPerms(r) },
      { icon: Pencil, label: this.i18n.t('common.edit'), tone: 'primary', onClick: r => this.open(r) },
      { icon: Trash2, label: this.i18n.t('common.delete'), tone: 'danger', onClick: r => this.askDelete(r) },
    ];
  });

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'code', type: 'text', label: 'Código', width: 'half',
        validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas, números y _' }] },
      { key: 'name', type: 'text', label: 'Nombre', width: 'half', validators: ['required'] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full' },
    ],
    submit: { show: false },
  };

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: r => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(r: Role | null) { this.dirty.set(false); this.editing.set(r ? { ...r } : {}); }
  close() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(v: any) {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    const obs = e.id ? this.api.update(e.id, v) : this.api.create(v);
    obs.subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.roles.toast.saved')); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(r: Role) {
    const ok = await this.confirm.ask({ title: this.i18n.t('admin.roles.delete.title'), message: this.i18n.t('admin.roles.delete.message', { code: r.code }), tone: 'danger', confirmText: this.i18n.t('common.delete') });
    if (!ok) return;
    this.api.remove(r.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.roles.toast.deleted')); this.refresh(); },
    });
  }

  openPerms(r: Role) {
    this.permsFor.set(r);
    this.loadingPerms.set(true);
    Promise.all([
      new Promise<Permission[]>(res => this.permsApi.list().subscribe({ next: res, error: () => res([]) })),
      new Promise<{ id: string }[]>(res => this.api.permissions(r.id).subscribe({ next: res, error: () => res([]) })),
    ]).then(([all, current]) => {
      this.allPerms.set(all);
      this.selected.set(new Set(current.map(p => p.id)));
      this.loadingPerms.set(false);
    });
  }

  closePerms() { this.permsFor.set(null); this.allPerms.set([]); this.selected.set(new Set()); }

  toggle(id: string, on: boolean) {
    this.selected.update(s => {
      const next = new Set(s);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  }

  savePerms() {
    const r = this.permsFor();
    if (!r) return;
    this.savingPerms.set(true);
    this.api.setPermissions(r.id, Array.from(this.selected())).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.roles.toast.permissions')); this.savingPerms.set(false); this.closePerms(); },
      error: () => this.savingPerms.set(false),
    });
  }
}
