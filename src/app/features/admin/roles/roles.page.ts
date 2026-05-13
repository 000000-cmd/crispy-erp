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

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CheckboxComponent, DrawerComponent, DataTableComponent, DynamicFormComponent, SpinnerComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text tracking-tight">Roles</h1>
          <p class="text-sm text-text-muted mt-0.5">Conjuntos de permisos asignables a usuarios.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="open(null)">Nuevo rol</app-button>
      </header>

      <app-data-table [columns]="columns" [rows]="items()" [actions]="actions" [loading]="loading()" />

      <!-- Edit/create drawer -->
      <app-drawer
        [open]="!!editing()"
        [title]="editing()?.id ? 'Editar rol' : 'Nuevo rol'"
        size="md"
        [showActions]="true"
        [dirty]="dirty()"
        [saving]="saving()"
        (save)="submitForm()"
        (onClose)="close()"
      >
        @if (editing()) {
          <app-dynamic-form
            #dynForm
            [schema]="schema"
            [model]="editing()!"
            [submitting]="saving()"
            (submitValue)="onSubmit($event)"
            (dirtyChange)="dirty.set($event)"
          />
        }
      </app-drawer>

      <!-- Permissions assignment modal -->
      <app-drawer [open]="!!permsFor()" [title]="permsFor()?.name + ' · permisos'" size="lg" (onClose)="closePerms()">
        @if (permsFor()) {
          @if (loadingPerms()) {
            <div class="py-10 text-center"><app-spinner [size]="24" /></div>
          } @else {
            <div class="space-y-3">
              <p class="text-xs text-text-muted">Marca los permisos que tendrá este rol. Los cambios se guardan al confirmar.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                @for (p of allPerms(); track p.id) {
                  <label class="flex items-start gap-2 p-2.5 rounded-md border border-border hover:bg-surface-hover cursor-pointer">
                    <span class="mt-0.5">
                      <app-checkbox
                        [checked]="selected().has(p.id)"
                        (checkedChange)="toggle(p.id, $event)"
                      />
                    </span>
                    <span class="min-w-0">
                      <span class="block text-sm font-medium text-text">{{ p.name }}</span>
                      <span class="block text-[11px] text-text-muted font-mono">{{ p.code }}</span>
                      @if (p.description) {
                        <span class="block text-[11px] text-text-muted mt-0.5 line-clamp-2">{{ p.description }}</span>
                      }
                    </span>
                  </label>
                }
              </div>
            </div>
          }
        }
        @if (permsFor()) {
          <div drawerFooter class="px-5 py-3 border-t border-border flex justify-end gap-2 bg-surface-muted">
            <app-button variant="ghost" (onClick)="closePerms()">Cancelar</app-button>
            <app-button [loading]="savingPerms()" (onClick)="savePerms()">Guardar permisos</app-button>
          </div>
        }
      </app-drawer>
    </div>
  `,
})
export class AdminRolesPage {
  private readonly api = inject(RolesApi);
  private readonly permsApi = inject(PermissionsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

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

  readonly columns: ColumnDef<Role>[] = [
    { key: 'code', label: 'Código', width: '180px' },
    { key: 'name', label: 'Nombre' },
    { key: 'description' as any, label: 'Descripción', format: r => r.description ?? '—' },
    { key: 'enabled' as any, label: 'Estado', align: 'center', format: r => r.enabled ? 'Activo' : 'Inactivo' },
  ];

  readonly actions: RowAction<Role>[] = [
    { icon: ShieldCheck, label: 'Permisos', tone: 'primary', onClick: r => this.openPerms(r) },
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.open(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ];

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
      next: () => { this.toast.success('Guardado'); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(r: Role) {
    const ok = await this.confirm.ask({ title: 'Eliminar rol', message: `¿Eliminar "${r.code}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.api.remove(r.id).subscribe({
      next: () => { this.toast.success('Eliminado'); this.refresh(); },
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
      next: () => { this.toast.success('Permisos actualizados'); this.savingPerms.set(false); this.closePerms(); },
      error: () => this.savingPerms.set(false),
    });
  }
}
