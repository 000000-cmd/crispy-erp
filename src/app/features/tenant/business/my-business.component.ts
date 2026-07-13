import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';

import { BusinessApi } from '../../admin/business/business.api';
import { Business, BusinessDomain } from '../../admin/business/business.model';
import { buildBusinessSchema } from '../../admin/business/business-form';

/** "Mi negocio": el dueño ve y edita su empresa y sus dominios/slug. */
@Component({
  selector: 'app-my-business',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DrawerComponent, DynamicFormComponent, InputComponent, TagComponent, PageHeaderComponent, SkeletonComponent],
  templateUrl: './my-business.component.html',
})
export class MyBusinessComponent {
  private readonly api = inject(BusinessApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly auth = inject(AuthService);

  readonly business = signal<Business | null>(null);
  readonly loading = signal(true);

  readonly editing = signal<Partial<Business> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly domains = signal<BusinessDomain[]>([]);
  readonly newSlug = signal('');
  readonly savingDomain = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly schema = computed(() => this.editing() ? buildBusinessSchema(this.systemListsApi, 'edit') : null);

  constructor() { this.load(); }

  private load() {
    const userId = this.auth.user()?.id;
    if (!userId) { this.loading.set(false); return; }
    this.loading.set(true);
    this.api.mine(userId).subscribe({
      next: list => {
        const b = list[0] ?? null;
        this.business.set(b);
        if (b) this.loadDomains(b.id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openEdit() { const b = this.business(); if (b) { this.dirty.set(false); this.editing.set({ ...b }); } }
  close() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(v: any) {
    const b = this.business();
    if (!b) return;
    this.saving.set(true);
    this.api.update(b.id, v).subscribe({
      next: () => { this.toast.success('Negocio actualizado'); this.saving.set(false); this.close(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  // ---- Dominios ----
  private loadDomains(businessId: string) {
    this.api.listDomains(businessId).subscribe({ next: d => this.domains.set(d) });
  }

  addDomain() {
    const b = this.business();
    const slug = this.newSlug().trim().toLowerCase();
    if (!b || !/^[a-z0-9-]{3,63}$/.test(slug)) return;
    this.savingDomain.set(true);
    this.api.createDomain({ businessId: b.id, slug, isPrimary: this.domains().length === 0 }).subscribe({
      next: () => { this.newSlug.set(''); this.savingDomain.set(false); this.toast.success('Dominio agregado'); this.loadDomains(b.id); },
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
    const ok = await this.confirm.ask({ title: 'Eliminar dominio', message: `¿Eliminar "${d.slug}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.api.removeDomain(d.id).subscribe({ next: () => { this.toast.success('Dominio eliminado'); this.loadDomains(d.businessId); } });
  }
}
