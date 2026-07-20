import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { LucideAngularModule, Plus, Pencil, Trash2, ArrowRight, MapPin, Phone } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { FormCompanionComponent } from '../../../shared/ui/form-companion/form-companion.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent, ColumnDef, RowAction } from '../../../shared/table/data-table.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption } from '../../../shared/ui/autocomplete/autocomplete.types';
import { LocationPickerComponent, LocationSelection } from '../../../shared/ui/location-picker/location-picker.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';

import { SedesApi } from './sedes.api';
import { Branch } from './sedes.model';
import { BranchForm, EMPTY_BRANCH_FORM } from './sedes.form';

/** Sedes (branch) del negocio del dueño. CRUD scopeado a su empresa. */
@Component({
  selector: 'app-tenant-sedes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LucideAngularModule, ButtonComponent, DrawerComponent, PageHeaderComponent, SkeletonComponent,
    FieldComponent, InputComponent, SwitchComponent, AutocompleteComponent, LocationPickerComponent, FormCompanionComponent, TPipe,
  ],
  templateUrl: './sedes.component.html',
})
export class SedesComponent {
  private readonly api = inject(SedesApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly plusIcon = Plus;
  protected readonly arrowIcon = ArrowRight;
  protected readonly pinIcon = MapPin;
  protected readonly phoneIcon = Phone;
  protected readonly trashIcon = Trash2;

  readonly businessId = signal<string | null>(null);
  readonly items = signal<Branch[]>([]);
  readonly loading = signal(true);

  readonly open = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly form = signal<BranchForm>({ ...EMPTY_BRANCH_FORM });
  /** Se activa al intentar guardar con datos inválidos → muestra los errores. */
  readonly tried = signal(false);
  readonly branchTypeOptions = signal<AutocompleteOption[]>([]);

  readonly formValid = computed(() => {
    const f = this.form();
    // Barrio/vereda ahora es obligatorio (ubicación completa hasta el barrio).
    return !!f.branchTypeId && f.name.trim().length >= 2 && !!f.municipalityId && !!f.neighborhoodId;
  });

  readonly columns = computed<ColumnDef<Branch>[]>(() => [
    { key: 'name', label: 'Sede' },
    { key: 'phone', label: 'Teléfono', width: '160px', format: r => r.phone || '—' },
    {
      key: 'isMain', label: 'Principal', align: 'center', width: '120px',
      tag: r => r.isMain ? { label: 'Principal', tone: 'primary' } : { label: 'Secundaria', tone: 'neutral' },
    },
  ]);

  readonly actions = computed<RowAction<Branch>[]>(() => [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.openEdit(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ]);

  constructor() {
    const userId = this.auth.user()?.id;
    if (!userId) { this.loading.set(false); return; }
    this.systemListsApi.itemsEnabled('branch_type').pipe(
      map<CatalogItem[], AutocompleteOption[]>(items => items.map(i => ({ value: i.id, label: i.name }))),
    ).subscribe({ next: o => this.branchTypeOptions.set(o) });

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
      next: b => { this.items.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  patch<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openCreate() { this.form.set({ ...EMPTY_BRANCH_FORM }); this.editingId.set(null); this.tried.set(false); this.open.set(true); }

  openEdit(b: Branch) {
    this.form.set({
      branchTypeId: b.branchTypeId, name: b.name,
      municipalityId: b.municipalityId, neighborhoodId: b.neighborhoodId ?? null,
      addressLine: b.addressLine ?? '', phone: b.phone ?? '', isMain: !!b.isMain,
    });
    this.editingId.set(b.id);
    this.tried.set(false);
    this.open.set(true);
  }

  close() { this.open.set(false); this.editingId.set(null); this.tried.set(false); }

  onLocation(sel: LocationSelection) {
    const m = sel.meta?.municipality as { meta?: { hit?: { municipalityId?: string } } } | null;
    const n = sel.meta?.neighborhood as { meta?: { hit?: { neighborhoodId?: string } } } | null;
    this.patch('municipalityId', m?.meta?.hit?.municipalityId ?? null);
    this.patch('neighborhoodId', n?.meta?.hit?.neighborhoodId ?? null);
  }

  save() {
    const businessId = this.businessId();
    if (!businessId) return;
    if (!this.formValid()) { this.tried.set(true); return; }
    const f = this.form();
    this.saving.set(true);
    const payload = {
      businessId,
      branchTypeId: f.branchTypeId!,
      name: f.name.trim(),
      municipalityId: f.municipalityId!,
      neighborhoodId: f.neighborhoodId || null,
      addressLine: f.addressLine || null,
      phone: f.phone || null,
      isMain: f.isMain,
    };
    const id = this.editingId();
    const obs = id ? this.api.update(id, payload) : this.api.create(payload);
    obs.subscribe({
      next: () => { this.toast.success('Sede guardada'); this.saving.set(false); this.close(); this.refresh(businessId); },
      // Antes se tragaba el error en silencio (se veía como "no guarda"). Ahora
      // se muestra el motivo real que devuelve el backend.
      error: (err) => {
        this.saving.set(false);
        this.toast.error('No se pudo guardar la sede', this.backendMessage(err));
      },
    });
  }

  /** Extrae el mensaje de error del ApiResponse del backend (o un fallback). */
  private backendMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e?.error?.message || e?.message || 'Revisa los datos e inténtalo de nuevo.';
  }

  async askDelete(b: Branch) {
    const ok = await this.confirm.ask({ title: 'Eliminar sede', message: `¿Eliminar "${b.name}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    const businessId = this.businessId();
    this.api.remove(b.id).subscribe({
      next: () => { this.toast.success('Sede eliminada'); if (businessId) this.refresh(businessId); },
    });
  }
}
