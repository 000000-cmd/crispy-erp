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
import { Constant, ConstantsApi } from './constants.api';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-constants',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, TPipe],
  templateUrl: './constants.page.html',
})
export class AdminConstantsPage {
  private readonly api = inject(ConstantsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Constant[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Constant> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly columns = computed<ColumnDef<Constant>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'code', label: this.i18n.t('common.code'), width: '180px' },
      { key: 'name', label: this.i18n.t('common.name') },
      { key: 'value', label: this.i18n.t('common.value'), width: '220px' },
      { key: 'enabled' as any, label: this.i18n.t('common.status'), align: 'center', format: r => r.enabled ? this.i18n.t('common.active') : this.i18n.t('common.inactive') },
    ];
  });

  readonly actions = computed<RowAction<Constant>[]>(() => {
    void this.i18n.dict();
    return [
      { icon: Pencil, label: this.i18n.t('common.edit'), tone: 'primary', onClick: r => this.open(r) },
      { icon: Trash2, label: this.i18n.t('common.delete'), tone: 'danger', onClick: r => this.askDelete(r) },
    ];
  });

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'code', type: 'text', label: 'Código', width: 'half', validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas, números y _' }] },
      { key: 'name',  type: 'text', label: 'Nombre', width: 'full', validators: ['required'] },
      { key: 'value', type: 'text', label: 'Valor', width: 'full', validators: ['required'] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full' },
    ],
    submit: { show: false },
  };

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: c => { this.items.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(c: Constant | null) { this.dirty.set(false); this.editing.set(c ? { ...c } : {}); }
  close() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(v: any) {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    const obs = e.id ? this.api.update(e.id, v) : this.api.create(v);
    obs.subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.constants.toast.saved')); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(c: Constant) {
    const ok = await this.confirm.ask({ title: this.i18n.t('admin.constants.delete.title'), message: this.i18n.t('admin.constants.delete.message', { code: c.code }), tone: 'danger', confirmText: this.i18n.t('common.delete') });
    if (!ok) return;
    this.api.remove(c.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.constants.toast.deleted')); this.refresh(); },
    });
  }
}
