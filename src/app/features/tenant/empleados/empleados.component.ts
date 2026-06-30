import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Plus, Pencil, Trash2 } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent, ColumnDef, RowAction } from '../../../shared/table/data-table.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption, AutocompleteSearchFn } from '../../../shared/ui/autocomplete/autocomplete.types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';
import { SystemListsApi, CatalogItem } from '../../admin/system-lists/system-lists.api';
import { ThirdPartyApi } from '../../admin/thirdparty/thirdparty.api';

import { SedesApi } from '../sedes/sedes.api';
import { Branch } from '../sedes/sedes.model';
import { EmpleadosApi } from './empleados.api';
import { EmployeeDetail } from './empleados.model';

interface EmpForm {
  thirdPartyId: string | null;
  personName: string;
  positionId: string | null;
  employeeCode: string;
  hireDate: string;
}
const EMPTY: EmpForm = { thirdPartyId: null, personName: '', positionId: null, employeeCode: '', hireDate: '' };

/** Empleados del negocio, por sede. CRUD scopeado a la empresa del dueño. */
@Component({
  selector: 'app-tenant-empleados',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, ButtonComponent, DrawerComponent, DataTableComponent,
    FieldComponent, InputComponent, AutocompleteComponent,
  ],
  templateUrl: './empleados.component.html',
})
export class EmpleadosComponent {
  private readonly api = inject(EmpleadosApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly tpApi = inject(ThirdPartyApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly plusIcon = Plus;

  readonly businessId = signal<string | null>(null);
  readonly branches = signal<Branch[]>([]);
  readonly selectedBranchId = signal<string | null>(null);
  readonly items = signal<EmployeeDetail[]>([]);
  readonly loading = signal(true);

  readonly positionOptions = signal<AutocompleteOption[]>([]);
  private readonly positionName = computed(() => {
    const m = new Map<string, string>();
    for (const o of this.positionOptions()) m.set(String(o.value), o.label);
    return m;
  });

  readonly branchOptions = computed<AutocompleteOption[]>(() =>
    this.branches().map(b => ({ value: b.id, label: b.name })));

  readonly open = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly form = signal<EmpForm>({ ...EMPTY });

  readonly formValid = computed(() => {
    const f = this.form();
    return !!f.thirdPartyId && !!f.positionId && !!f.hireDate;
  });

  readonly personSearchFn: AutocompleteSearchFn = (term: string) =>
    this.tpApi.search({ q: term || undefined, size: 10 }).pipe(
      map(r => r.items.map(t => ({
        value: t.id,
        label: t.fullName || [t.firstName, t.firstLastName].filter(Boolean).join(' ') || t.documentNumber,
      }))),
    );

  readonly columns = computed<ColumnDef<EmployeeDetail>[]>(() => [
    { key: 'personName', label: 'Empleado' },
    { key: 'positionId', label: 'Cargo', format: r => this.positionName().get(r.positionId) ?? '—' },
    { key: 'employeeCode', label: 'Código', width: '140px', format: r => r.employeeCode || '—' },
    { key: 'hireDate', label: 'Ingreso', width: '140px', format: r => r.hireDate ?? '—' },
    {
      key: 'enabled', label: 'Estado', align: 'center', width: '120px',
      tag: r => r.enabled ? { label: 'Activo', tone: 'success' } : { label: 'Inactivo', tone: 'neutral' },
    },
  ]);

  readonly actions = computed<RowAction<EmployeeDetail>[]>(() => [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.openEdit(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ]);

  constructor() {
    const userId = this.auth.user()?.id;
    if (!userId) { this.loading.set(false); return; }
    this.systemListsApi.itemsEnabled('employee_position').pipe(
      map<CatalogItem[], AutocompleteOption[]>(items => items.map(i => ({ value: i.id, label: i.name }))),
    ).subscribe({ next: o => this.positionOptions.set(o) });

    this.businessApi.mine(userId).subscribe({
      next: list => {
        const id = list[0]?.id ?? null;
        this.businessId.set(id);
        if (!id) { this.loading.set(false); return; }
        this.sedesApi.list(id).subscribe({
          next: bs => {
            this.branches.set(bs);
            const first = bs[0]?.id ?? null;
            this.selectedBranchId.set(first);
            if (first) this.refresh(first); else this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  onBranch(branchId: string | null) {
    this.selectedBranchId.set(branchId);
    if (branchId) this.refresh(branchId); else this.items.set([]);
  }

  private refresh(branchId: string) {
    this.loading.set(true);
    this.api.listDetailed(branchId).subscribe({
      next: e => { this.items.set(e); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  patch<K extends keyof EmpForm>(key: K, value: EmpForm[K]) { this.form.update(f => ({ ...f, [key]: value })); }

  openCreate() { this.form.set({ ...EMPTY }); this.editingId.set(null); this.open.set(true); }
  openEdit(e: EmployeeDetail) {
    this.form.set({
      thirdPartyId: e.thirdPartyId, personName: e.personName, positionId: e.positionId,
      employeeCode: e.employeeCode ?? '', hireDate: e.hireDate ?? '',
    });
    this.editingId.set(e.id);
    this.open.set(true);
  }
  close() { this.open.set(false); this.editingId.set(null); }

  save() {
    const branchId = this.selectedBranchId();
    if (!branchId || !this.formValid()) return;
    const f = this.form();
    this.saving.set(true);
    const payload = {
      thirdPartyId: f.thirdPartyId!, branchId, positionId: f.positionId!,
      employeeCode: f.employeeCode || null, hireDate: f.hireDate,
    };
    const id = this.editingId();
    const obs = id ? this.api.update(id, payload) : this.api.create(payload);
    obs.subscribe({
      next: () => { this.toast.success('Empleado guardado'); this.saving.set(false); this.close(); this.refresh(branchId); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(e: EmployeeDetail) {
    const ok = await this.confirm.ask({ title: 'Eliminar empleado', message: `¿Eliminar a "${e.personName}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    const branchId = this.selectedBranchId();
    this.api.remove(e.id).subscribe({
      next: () => { this.toast.success('Empleado eliminado'); if (branchId) this.refresh(branchId); },
    });
  }
}
