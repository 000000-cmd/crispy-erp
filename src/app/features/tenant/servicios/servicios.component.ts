import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Plus, Pencil, Trash2, Clock, Settings2, Scissors, LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { FormCompanionComponent } from '../../../shared/ui/form-companion/form-companion.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { formatCOP } from '../../../shared/util/money';

import { ServiciosApi } from './servicios.api';
import { Offering } from './servicios.model';
import { OfferingCategory } from '../catalogos/catalog.model';
import { CategoriasApi } from '../catalogos/categorias.api';
import { SpecialtiesApi } from '../catalogos/specialties.api';
import { CatalogManagerComponent } from '../catalogos/catalog-manager.component';

/**
 * Servicios (offerings) del negocio del dueño. Vista tipo "carta de precios":
 * grid de cards con el precio como protagonista (máscara es-CO), duración como
 * chip, interruptor de activo directo en la card y acciones al hover — nada de
 * tabla plana. El drawer usa el campo `money` (máscara en vivo).
 */
@Component({
  selector: 'app-tenant-servicios',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DynamicFormComponent, PageHeaderComponent, SkeletonComponent, FormCompanionComponent, CatalogManagerComponent, TPipe],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {
  private readonly api = inject(ServiciosApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly categoriasApi = inject(CategoriasApi);
  private readonly specialtiesApi = inject(SpecialtiesApi);

  protected readonly plusIcon = Plus;
  protected readonly pencilIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly clockIcon = Clock;
  protected readonly settingsIcon = Settings2;
  protected readonly categoryIcon = Scissors;
  protected readonly fmt = formatCOP;

  // El gate de onboarding garantiza negocio: el id vive en la sesión.
  readonly businessId = signal<string | null>(this.auth.user()?.businessId ?? null);
  readonly items = signal<Offering[]>([]);
  readonly categories = signal<OfferingCategory[]>([]);

  /** Servicios agrupados por categoría (bento del diseño). "Sin categoría" al final. */
  readonly grouped = computed(() => {
    const name = new Map(this.categories().map(c => [c.id, c.name]));
    const groups = new Map<string, { key: string; name: string; items: Offering[] }>();
    for (const o of this.items()) {
      const key = o.categoryId ?? '__none';
      if (!groups.has(key)) {
        groups.set(key, { key, name: o.categoryId ? (name.get(o.categoryId) ?? 'Categoría') : 'Sin categoría', items: [] });
      }
      groups.get(key)!.items.push(o);
    }
    return [...groups.values()].sort((a, b) => (a.key === '__none' ? 1 : b.key === '__none' ? -1 : 0));
  });
  readonly loading = signal(true);
  readonly editing = signal<Partial<Offering> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  /** Ids con el toggle de activo en vuelo (evita doble click). */
  readonly toggling = signal<Set<string>>(new Set());
  /** Gestor de categorías y especialidades (modal). */
  readonly showCatalogs = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'name', type: 'text', label: 'Nombre', width: 'full', validators: ['required', { kind: 'maxLength', value: 160 }] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full', validators: [{ kind: 'maxLength', value: 500 }] },
      { key: 'categoryId', type: 'select', label: 'Categoría', width: 'half',
        options: () => this.categoriasApi.list(this.businessId() ?? '').pipe(
          map(cs => cs.map(c => ({ value: c.id, label: c.name }))),
        ) },
      { key: 'specialtyId', type: 'select', label: 'Especialidad', width: 'half',
        options: () => this.specialtiesApi.list(this.businessId() ?? '').pipe(
          map(ss => ss.map(s => ({ value: s.id, label: s.name }))),
        ) },
      { key: 'durationMinutes', type: 'number', label: 'Duración (min)', width: 'half', validators: ['required', { kind: 'min', value: 1 }] },
      { key: 'price', type: 'money', label: 'Precio', width: 'half', validators: ['required', { kind: 'min', value: 0 }] },
      { key: 'isActive', type: 'switch', label: 'Activo', width: 'full', defaultValue: true },
    ],
    submit: { show: false },
  };

  constructor() {
    const id = this.businessId();
    if (id) this.refresh(id); else this.loading.set(false);
  }

  private refresh(businessId: string) {
    this.loading.set(true);
    this.categoriasApi.list(businessId).subscribe({ next: c => this.categories.set(c) });
    this.api.list(businessId).subscribe({
      next: o => { this.items.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  /** Color del badge de categoría, alternando como en el diseño (bento). */
  badgeClass(i: number): string {
    return ['bg-primary-fixed text-primary', 'bg-tertiary-fixed text-tertiary', 'bg-secondary-container text-secondary'][i % 3];
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

  /** Interruptor de activo directo en la card (PUT inmediato, optimista). */
  toggleActive(o: Offering) {
    const businessId = this.businessId();
    if (!businessId || this.toggling().has(o.id)) return;
    const next = !o.isActive;
    this.toggling.update(s => new Set(s).add(o.id));
    this.items.update(list => list.map(x => x.id === o.id ? { ...x, isActive: next } : x));
    this.api.update(o.id, { ...o, isActive: next, businessId }).subscribe({
      next: () => {
        this.toggling.update(s => { const n = new Set(s); n.delete(o.id); return n; });
        this.toast.success(next ? 'Servicio activado' : 'Servicio desactivado');
      },
      error: () => {
        // Revertir el optimismo si el back rechazó.
        this.items.update(list => list.map(x => x.id === o.id ? { ...x, isActive: !next } : x));
        this.toggling.update(s => { const n = new Set(s); n.delete(o.id); return n; });
      },
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
