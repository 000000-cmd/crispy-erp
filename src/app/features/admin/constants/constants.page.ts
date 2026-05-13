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

@Component({
  selector: 'app-admin-constants',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DataTableComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Constantes</h1>
          <p class="text-sm text-text-muted">Valores globales accesibles por código en runtime.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="open(null)">Nueva constante</app-button>
      </header>

      <app-data-table [columns]="columns" [rows]="items()" [actions]="actions" [loading]="loading()" />

      <app-drawer
        [open]="!!editing()"
        [title]="editing()?.id ? 'Editar constante' : 'Nueva constante'"
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
    </div>
  `,
})
export class AdminConstantsPage {
  private readonly api = inject(ConstantsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;

  readonly items = signal<Constant[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Constant> | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly columns: ColumnDef<Constant>[] = [
    { key: 'code', label: 'Código', width: '180px' },
    { key: 'name', label: 'Nombre' },
    { key: 'value', label: 'Valor', width: '220px' },
    { key: 'enabled' as any, label: 'Estado', align: 'center', format: r => r.enabled ? 'Activa' : 'Inactiva' },
  ];

  readonly actions: RowAction<Constant>[] = [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.open(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ];

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
      next: () => { this.toast.success('Guardado'); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(c: Constant) {
    const ok = await this.confirm.ask({ title: 'Eliminar constante', message: `¿Eliminar "${c.code}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.api.remove(c.id).subscribe({
      next: () => { this.toast.success('Eliminada'); this.refresh(); },
    });
  }
}
