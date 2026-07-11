import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Plus, Pencil, Trash2, Star } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent, ColumnDef, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SystemListsApi } from '../system-lists/system-lists.api';

import { BusinessApi } from './business.api';
import { Business, BusinessDomain } from './business.model';
import { buildBusinessSchema } from './business-form';

/** CRUD de empresas + gestión de sus dominios/slug. */
@Component({
  selector: 'app-admin-business',
  standalone: true,
  imports: [
    CommonModule, ButtonComponent, DrawerComponent, DataTableComponent,
    DynamicFormComponent, InputComponent, TagComponent, PageHeaderComponent,
  ],
  templateUrl: './business.component.html',
})
export class AdminBusinessComponent {
  private readonly api = inject(BusinessApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Business[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Business> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  // Dominios del negocio en edición
  readonly domains = signal<BusinessDomain[]>([]);
  readonly newSlug = signal('');
  readonly savingDomain = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly schema = computed(() => {
    const e = this.editing();
    if (!e) return null;
    return buildBusinessSchema(this.systemListsApi, e.id ? 'edit' : 'create');
  });

  readonly columns = computed<ColumnDef<Business>[]>(() => [
    { key: 'name', label: 'Nombre' },
    { key: 'tradeName', label: 'Nombre comercial', format: r => r.tradeName || '—' },
    { key: 'documentNumber', label: 'Documento', width: '160px', format: r => r.documentNumber || '—' },
    {
      key: 'enabled', label: 'Habilitado', align: 'center', width: '120px',
      tag: r => r.enabled ? { label: 'Activo', tone: 'success' } : { label: 'Inactivo', tone: 'neutral' },
    },
  ]);

  readonly actions = computed<RowAction<Business>[]>(() => [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.openEdit(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ]);

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: b => { this.items.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.dirty.set(false); this.domains.set([]); this.editing.set({}); }

  openEdit(b: Business) {
    this.dirty.set(false);
    this.editing.set({ ...b });
    this.loadDomains(b.id);
  }

  close() { this.editing.set(null); this.dirty.set(false); this.domains.set([]); this.newSlug.set(''); }

  onSubmit(v: any) {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    const obs = e.id ? this.api.update(e.id, v) : this.api.create(v);
    obs.subscribe({
      next: () => { this.toast.success('Empresa guardada correctamente'); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(b: Business) {
    const ok = await this.confirm.ask({
      title: 'Eliminar empresa',
      message: `¿Desea eliminar la empresa "${b.name}"?`,
      tone: 'danger', confirmText: 'Eliminar',
    });
    if (!ok) return;
    this.api.remove(b.id).subscribe({
      next: () => { this.toast.success('Empresa eliminada correctamente'); this.refresh(); },
    });
  }

  // ---- Dominios ----
  private loadDomains(businessId: string) {
    this.api.listDomains(businessId).subscribe({ next: d => this.domains.set(d) });
  }

  addDomain() {
    const e = this.editing();
    const slug = this.newSlug().trim().toLowerCase();
    if (!e?.id || !/^[a-z0-9-]{3,63}$/.test(slug)) return;
    this.savingDomain.set(true);
    this.api.createDomain({ businessId: e.id, slug, isPrimary: this.domains().length === 0 }).subscribe({
      next: () => { this.newSlug.set(''); this.savingDomain.set(false); this.toast.success('Dominio agregado'); this.loadDomains(e.id!); },
      error: () => this.savingDomain.set(false),
    });
  }

  setPrimary(d: BusinessDomain) {
    if (d.isPrimary) return;
    this.api.updateDomain(d.id, { businessId: d.businessId, slug: d.slug, isPrimary: true }).subscribe({
      next: () => { this.toast.success('Dominio principal actualizado'); this.loadDomains(d.businessId); },
    });
  }

  async removeDomain(d: BusinessDomain) {
    const ok = await this.confirm.ask({
      title: 'Eliminar dominio', message: `¿Eliminar el dominio "${d.slug}"?`, tone: 'danger', confirmText: 'Eliminar',
    });
    if (!ok) return;
    this.api.removeDomain(d.id).subscribe({
      next: () => { this.toast.success('Dominio eliminado'); this.loadDomains(d.businessId); },
    });
  }

  protected readonly starIcon = Star;
}
