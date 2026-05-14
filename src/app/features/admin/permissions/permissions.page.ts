import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { ColumnDef, DataTableComponent, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Permission, PermissionsApi } from './permissions.api';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, TPipe],
  templateUrl: './permissions.page.html',
})
export class AdminPermissionsPage {
  private readonly api = inject(PermissionsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Permission> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly columns = computed<ColumnDef<Permission>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'code', label: this.i18n.t('common.code'), width: '180px' },
      { key: 'name', label: this.i18n.t('common.name') },
      { key: 'description' as any, label: this.i18n.t('common.description'), format: r => r.description ?? '—' },
      { key: 'enabled' as any, label: this.i18n.t('common.status'), align: 'center', format: r => r.enabled ? this.i18n.t('common.active') : this.i18n.t('common.inactive') },
    ];
  });

  readonly actions = computed<RowAction<Permission>[]>(() => {
    void this.i18n.dict();
    return [
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
      next: p => { this.items.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(p: Permission | null) { this.dirty.set(false); this.editing.set(p ? { ...p } : {}); }
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

  async askDelete(p: Permission) {
    const ok = await this.confirm.ask({ title: this.i18n.t('admin.permissions.delete.title'), message: this.i18n.t('admin.permissions.delete.message', { code: p.code }), tone: 'danger', confirmText: this.i18n.t('common.delete') });
    if (!ok) return;
    this.api.remove(p.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.roles.toast.deleted')); this.refresh(); },
    });
  }
}
