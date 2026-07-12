import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plus, Pencil, Trash2 } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent, ColumnDef, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { FormCompanionComponent } from '../../../shared/ui/form-companion/form-companion.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';

import { ServiciosApi } from './servicios.api';
import { Offering } from './servicios.model';

/** Servicios (offerings) del negocio del dueño. CRUD scopeado a su empresa. */
@Component({
  selector: 'app-tenant-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, PageHeaderComponent, SkeletonComponent, FormCompanionComponent, TPipe],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {
  private readonly api = inject(ServiciosApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly plusIcon = Plus;

  readonly businessId = signal<string | null>(null);
  readonly items = signal<Offering[]>([]);
  readonly loading = signal(true);
  readonly editing = signal<Partial<Offering> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly columns = computed<ColumnDef<Offering>[]>(() => [
    { key: 'name', label: 'Servicio' },
    { key: 'durationMinutes', label: 'Duración', width: '120px', align: 'center', format: r => `${r.durationMinutes} min` },
    { key: 'price', label: 'Precio', width: '120px', align: 'right', format: r => `$${r.price}` },
    {
      key: 'isActive', label: 'Estado', align: 'center', width: '120px',
      tag: r => r.isActive ? { label: 'Activo', tone: 'success' } : { label: 'Inactivo', tone: 'neutral' },
    },
  ]);

  readonly actions = computed<RowAction<Offering>[]>(() => [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.openEdit(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ]);

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'name', type: 'text', label: 'Nombre', width: 'full', validators: ['required', { kind: 'maxLength', value: 160 }] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full', validators: [{ kind: 'maxLength', value: 500 }] },
      { key: 'durationMinutes', type: 'number', label: 'Duración (min)', width: 'half', validators: ['required', { kind: 'min', value: 1 }] },
      { key: 'price', type: 'number', label: 'Precio', width: 'half', validators: ['required', { kind: 'min', value: 0 }] },
      { key: 'isActive', type: 'switch', label: 'Activo', width: 'full', defaultValue: true },
    ],
    submit: { show: false },
  };

  constructor() {
    const userId = this.auth.user()?.id;
    if (!userId) { this.loading.set(false); return; }
    this.businessApi.mine(userId).subscribe({
      next: list => {
        const id = list[0]?.id ?? null;
        this.businessId.set(id);
        if (id) this.refresh(id); else this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private refresh(businessId: string) {
    this.loading.set(true);
    this.api.list(businessId).subscribe({
      next: o => { this.items.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.dirty.set(false); this.editing.set({ isActive: true }); }
  openEdit(o: Offering) { this.dirty.set(false); this.editing.set({ ...o }); }
  close() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(v: any) {
    const businessId = this.businessId();
    const e = this.editing();
    if (!businessId || !e) return;
    this.saving.set(true);
    const payload = { ...v, businessId, isActive: v.isActive ?? true };
    const obs = e.id ? this.api.update(e.id, payload) : this.api.create(payload);
    obs.subscribe({
      next: () => { this.toast.success('Servicio guardado'); this.saving.set(false); this.close(); this.refresh(businessId); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(o: Offering) {
    const ok = await this.confirm.ask({ title: 'Eliminar servicio', message: `¿Eliminar "${o.name}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    const businessId = this.businessId();
    this.api.remove(o.id).subscribe({
      next: () => { this.toast.success('Servicio eliminado'); if (businessId) this.refresh(businessId); },
    });
  }
}
