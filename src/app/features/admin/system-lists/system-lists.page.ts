import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, ListTree } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema } from '../../../shared/forms/core/types';
import { SystemList, SystemListItem, SystemListsApi } from './system-lists.api';

@Component({
  selector: 'app-admin-system-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, ModalComponent, SwitchComponent, EmptyComponent, SpinnerComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header>
        <h1 class="text-xl font-semibold text-text">Listas del sistema</h1>
        <p class="text-sm text-text-muted">Tablas de catálogo · creadas por script, editables manualmente.</p>
      </header>

      <div class="grid grid-cols-12 gap-4">
        <!-- Master -->
        <aside class="col-span-12 md:col-span-4 lg:col-span-3 rounded-lg border border-border bg-surface">
          <div class="px-4 py-3 border-b border-border flex items-center justify-between">
            <span class="text-sm font-medium">Catálogos</span>
            <span class="text-xs text-text-muted">{{ lists().length }}</span>
          </div>
          @if (loadingLists()) {
            <div class="p-6 text-center"><app-spinner /></div>
          } @else if (!lists().length) {
            <app-empty title="Sin catálogos" [icon]="treeIcon" />
          } @else {
            <ul class="divide-y divide-border">
              @for (l of lists(); track l.id) {
                <li>
                  <button
                    type="button"
                    class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                    [class.bg-primary-50]="selectedId() === l.id"
                    [class.dark:bg-primary-900/20]="selectedId() === l.id"
                    (click)="select(l)"
                  >
                    <span class="mt-0.5 text-text-soft"><lucide-icon [img]="treeIcon" [size]="14"></lucide-icon></span>
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm font-medium text-text truncate">{{ l.name }}</span>
                      <span class="block text-[11px] text-text-muted font-mono">{{ l.code }} · {{ l.itemsCount ?? '–' }} items</span>
                    </span>
                  </button>
                </li>
              }
            </ul>
          }
        </aside>

        <!-- Detail -->
        <section class="col-span-12 md:col-span-8 lg:col-span-9 rounded-lg border border-border bg-surface flex flex-col">
          @if (!selected()) {
            <div class="p-10 text-center text-text-muted">Selecciona un catálogo para ver sus items.</div>
          } @else {
            <header class="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-text">{{ selected()!.name }} <span class="text-[11px] font-mono text-text-muted bg-surface-muted px-1.5 py-0.5 rounded ml-1">{{ selected()!.code }}</span></h2>
                @if (selected()!.description) { <p class="text-xs text-text-muted mt-0.5">{{ selected()!.description }}</p> }
              </div>
              <app-button [icon]="plusIcon" size="sm" (onClick)="openItem(null)">Añadir</app-button>
            </header>

            @if (loadingItems()) {
              <div class="p-10 text-center"><app-spinner /></div>
            } @else if (!items().length) {
              <app-empty title="Sin items" />
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-surface-muted text-text-muted text-[11px] uppercase tracking-wide">
                    <tr>
                      <th class="px-4 py-2.5 text-left font-medium w-32">Código</th>
                      <th class="px-4 py-2.5 text-left font-medium">Nombre</th>
                      <th class="px-4 py-2.5 text-left font-medium w-32">Habilitado</th>
                      <th class="px-4 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (it of items(); track it.id) {
                      <tr class="border-t border-border hover:bg-surface-hover">
                        <td class="px-4 py-2 font-mono text-xs">
                          <input class="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary-500/30 rounded px-1"
                                 [value]="it.code" (change)="patchItem(it, { code: $any($event.target).value })" />
                        </td>
                        <td class="px-4 py-2">
                          <input class="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary-500/30 rounded px-1"
                                 [value]="it.name" (change)="patchItem(it, { name: $any($event.target).value })" />
                        </td>
                        <td class="px-4 py-2">
                          <app-switch [ngModel]="it.enabled" (ngModelChange)="patchItem(it, { enabled: $event })"></app-switch>
                        </td>
                        <td class="px-4 py-2 text-right">
                          <button (click)="deleteItem(it)" class="h-7 w-7 rounded-md hover:bg-surface-muted text-text-muted hover:text-rose-600 inline-flex items-center justify-center">
                            <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
                <p class="px-4 py-3 text-[11px] text-text-muted">Edita código o nombre directamente. Los cambios se guardan al perder el foco.</p>
              </div>
            }
          }
        </section>
      </div>

      <app-modal [open]="itemModalOpen()" [title]="'Nuevo item'" size="md" (onClose)="itemModalOpen.set(false)">
        @if (itemModalOpen() && selected()) {
          <app-dynamic-form
            [schema]="itemSchema"
            [model]="{ enabled: true }"
            (submitValue)="createItem($event)"
          />
        }
      </app-modal>
    </div>
  `,
})
export class AdminSystemListsPage {
  private readonly api = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;
  protected readonly trashIcon = Trash2;
  protected readonly treeIcon = ListTree;

  readonly lists = signal<SystemList[]>([]);
  readonly items = signal<SystemListItem[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly loadingLists = signal(false);
  readonly loadingItems = signal(false);
  readonly itemModalOpen = signal(false);

  readonly selected = computed(() => this.lists().find(l => l.id === this.selectedId()) ?? null);

  readonly itemSchema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'code', type: 'text', label: 'Código',  width: 'half', validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas, números y _' }] },
      { key: 'name', type: 'text', label: 'Nombre', width: 'half', validators: ['required'] },
      { key: 'description', type: 'textarea', label: 'Descripción', width: 'full' },
      { key: 'enabled', type: 'switch', label: 'Habilitado', width: 'full', defaultValue: true },
    ],
    submit: { label: 'Crear item' },
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

  openItem(_: null) { this.itemModalOpen.set(true); }

  createItem(value: any) {
    const id = this.selectedId();
    if (!id) return;
    this.api.createItem(id, value).subscribe({
      next: () => { this.toast.success('Item creado'); this.itemModalOpen.set(false); this.loadItems(); },
    });
  }

  async deleteItem(it: SystemListItem) {
    const ok = await this.confirm.ask({
      title: 'Eliminar item', message: `¿Eliminar "${it.name}"?`,
      confirmText: 'Eliminar', tone: 'danger',
    });
    if (!ok) return;
    this.api.deleteItem(it.listId, it.id).subscribe({
      next: () => { this.toast.success('Eliminado'); this.loadItems(); },
    });
  }
}
