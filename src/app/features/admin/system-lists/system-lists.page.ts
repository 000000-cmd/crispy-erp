import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, ListTree } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { SystemList, SystemListItem, SystemListsApi } from './system-lists.api';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-system-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, DrawerComponent, SwitchComponent, EmptyComponent, SpinnerComponent, DynamicFormComponent, TPipe],
  templateUrl: './system-lists.page.html',
})
export class AdminSystemListsPage {
  private readonly api = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;
  protected readonly trashIcon = Trash2;
  protected readonly treeIcon = ListTree;

  readonly lists = signal<SystemList[]>([]);
  readonly items = signal<SystemListItem[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly loadingLists = signal(false);
  readonly loadingItems = signal(false);
  readonly itemModalOpen = signal(false);
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  closeItemDrawer() { this.itemModalOpen.set(false); this.dirty.set(false); }

  readonly selected = computed(() => this.lists().find(l => l.id === this.selectedId()) ?? null);

  readonly itemSchema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'code', type: 'text', label: 'Código',  width: 'half', validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas, números y _' }] },
      { key: 'name', type: 'text', label: 'Nombre', width: 'half', validators: ['required'] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full' },
      { key: 'displayOrder', type: 'number', label: 'Orden', width: 'half', defaultValue: 1, validators: ['required'] },
    ],
    submit: { show: false },
  };

  constructor() { this.loadLists(); }

  loadLists() {
    this.loadingLists.set(true);
    this.api.lists().subscribe({
      next: ls => {
        this.lists.set(ls);
        this.loadingLists.set(false);
        if (ls.length && !this.selectedId()) this.select(ls[0]);
      },
      error: () => this.loadingLists.set(false),
    });
  }

  select(l: SystemList) {
    this.selectedId.set(l.id);
    this.loadItems();
  }

  loadItems() {
    const id = this.selectedId();
    if (!id) return;
    this.loadingItems.set(true);
    this.api.items(id).subscribe({
      next: i => { this.items.set(i); this.loadingItems.set(false); },
      error: () => this.loadingItems.set(false),
    });
  }

  patchItem(it: SystemListItem, p: Partial<SystemListItem>) {
    this.api.updateItem(it.listId, it.id, { ...it, ...p }).subscribe({
      next: updated => {
        this.items.update(arr => arr.map(x => x.id === updated.id ? updated : x));
      },
    });
  }

  openItem(_: null) { this.dirty.set(false); this.itemModalOpen.set(true); }

  createItem(value: any) {
    const id = this.selectedId();
    if (!id) return;
    this.api.createItem(id, value).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.lists.toast.created')); this.closeItemDrawer(); this.loadItems(); },
    });
  }

  async deleteItem(it: SystemListItem) {
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.lists.items.delete.title'), message: this.i18n.t('admin.lists.items.delete.message', { name: it.name }),
      confirmText: this.i18n.t('common.delete'), tone: 'danger',
    });
    if (!ok) return;
    this.api.deleteItem(it.listId, it.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.lists.toast.deleted')); this.loadItems(); },
    });
  }
}
