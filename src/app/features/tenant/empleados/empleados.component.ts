import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Plus, Pencil, Trash2 } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent, ColumnDef, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption } from '../../../shared/ui/autocomplete/autocomplete.types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';

import { SedesApi } from '../sedes/sedes.api';
import { Branch } from '../sedes/sedes.model';
import { EmpleadosApi } from './empleados.api';
import { EmployeeDetail } from './empleados.model';
import { EmployeeEditForm, EMPTY_EMPLOYEE_EDIT_FORM, buildEmployeeProvisionSchema } from './empleados-form';

/**
 * Empleados del negocio, por sede.
 *
 * ALTA: el dueño crea al empleado COMPLETO (cuenta con rol EMPLOYEE + persona +
 * registro laboral) — el empleado entra por la app móvil y completa sus datos
 * en su primer ingreso. EDICIÓN: sólo lo laboral (cargo/código/fecha).
 */
@Component({
  selector: 'app-tenant-empleados',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, ButtonComponent, DrawerComponent, DataTableComponent,
    DynamicFormComponent, FieldComponent, InputComponent, AutocompleteComponent,
  ],
  templateUrl: './empleados.component.html',
})
export class EmpleadosComponent {
  private readonly api = inject(EmpleadosApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly systemListsApi = inject(SystemListsApi);
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

  readonly selectedBranchName = computed(() =>
    this.branches().find(b => b.id === this.selectedBranchId())?.name ?? '');

  // Drawer: 'create' = alta completa (dynamic form) | 'edit' = laboral (manual)
  readonly open = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly editForm = signal<EmployeeEditForm>({ ...EMPTY_EMPLOYEE_EDIT_FORM });
  private editingSnapshot: EmployeeDetail | null = null;

  readonly provisionSchema = buildEmployeeProvisionSchema(this.systemListsApi);
  readonly provisionModel = signal<Record<string, unknown>>({});

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');

  readonly editValid = computed(() => {
    const f = this.editForm();
    return !!f.positionId && !!f.hireDate;
  });

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

  patchEdit<K extends keyof EmployeeEditForm>(key: K, value: EmployeeEditForm[K]) {
    this.editForm.update(f => ({ ...f, [key]: value }));
  }

  // ---- Alta completa ----
  openCreate() {
    this.provisionModel.set({});
    this.dirty.set(false);
    this.editingId.set(null);
    this.open.set(true);
  }

  submitDrawer() {
    if (this.editingId()) { this.saveEdit(); return; }
    this.dynForm()?.submit();
  }

  onProvisionSubmit(v: any) {
    const branchId = this.selectedBranchId();
    if (!branchId) return;
    this.saving.set(true);
    this.api.provision({
      branchId,
      positionId: v.positionId,
      hireDate: v.hireDate,
      employeeCode: v.employeeCode || null,
      documentTypeId: v.documentTypeId,
      documentNumber: v.documentNumber,
      firstName: v.firstName,
      secondName: v.secondName || null,
      firstLastName: v.firstLastName,
      secondLastName: v.secondLastName || null,
      genderId: v.genderId || null,
      birthDate: v.birthDate || null,
      email: v.email,
      username: v.username,
      password: v.password,
    }).subscribe({
      next: r => {
        this.toast.success(`Empleado creado. Su usuario para la app es "${r.username}".`);
        this.saving.set(false);
        this.close();
        this.refresh(branchId);
      },
      error: () => this.saving.set(false),
    });
  }

  // ---- Edición laboral ----
  openEdit(e: EmployeeDetail) {
    this.editingSnapshot = e;
    this.editForm.set({
      personName: e.personName,
      positionId: e.positionId,
      employeeCode: e.employeeCode ?? '',
      hireDate: e.hireDate ?? '',
    });
    this.dirty.set(false);
    this.editingId.set(e.id);
    this.open.set(true);
  }

  private saveEdit() {
    const id = this.editingId();
    const branchId = this.selectedBranchId();
    const snapshot = this.editingSnapshot;
    if (!id || !branchId || !snapshot || !this.editValid()) return;
    const f = this.editForm();
    this.saving.set(true);
    this.api.update(id, {
      thirdPartyId: snapshot.thirdPartyId,
      branchId,
      positionId: f.positionId!,
      employeeCode: f.employeeCode || null,
      hireDate: f.hireDate,
    }).subscribe({
      next: () => { this.toast.success('Empleado actualizado'); this.saving.set(false); this.close(); this.refresh(branchId); },
      error: () => this.saving.set(false),
    });
  }

  close() {
    this.open.set(false);
    this.editingId.set(null);
    this.dirty.set(false);
    this.editingSnapshot = null;
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
