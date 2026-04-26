import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ColumnDef, DataTableComponent, RowAction } from '../../../shared/table/data-table.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Permission, PermissionsApi } from './permissions.api';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, ModalComponent, DataTableComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text tracking-tight">Permisos</h1>
          <p class="text-sm text-text-muted mt-0.5">Acciones discretas que se asignan a roles.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="open(null)">Nuevo permiso</app-button>
      </header>

      <app-data-table [columns]="columns" [rows]="items()" [actions]="actions" [loading]="loading()" />

      <app-modal [open]="!!editing()" [title]="editing()?.id ? 'Editar permiso' : 'Nuevo permiso'" size="md" (onClose)="close()">
        @if (editing()) {
          <app-dynamic-form [schema]="schema" [model]="editing()!" [submitting]="saving()" (submitValue)="onSubmit($event)" />
        }
      </app-modal>
    </div>
  `,
})
export class AdminPermissionsPage {
  private readonly api = inject(PermissionsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Permission> | null>(null);
  readonly saving = signal(false);

  readonly columns: ColumnDef<Permission>[] = [
    { key: 'code', label: 'Código', width: '180px' },
    { key: 'name', label: 'Nombre' },
    { key: 'description' as any, label: 'Descripción', format: r => r.description ?? '—' },
    { key: 'enabled' as any, label: 'Estado', align: 'center', format: r => r.enabled ? 'Activo' : 'Inactivo' },
  ];

  readonly actions: RowAction<Permission>[] = [
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
  };

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: p => { this.items.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(p: Permission | null) { this.editing.set(p ? { ...p } : {}); }
  close() { this.editing.set(null); }

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

  async askDelete(p: Permission) {
    const ok = await this.confirm.ask({ title: 'Eliminar permiso', message: `¿Eliminar "${p.code}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.api.remove(p.id).subscribe({
      next: () => { this.toast.success('Eliminado'); this.refresh(); },
    });
  }
}
