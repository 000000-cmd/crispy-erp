import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, Shield, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { resolveIcon } from '../../../layouts/shell/icon-resolver';
import { AdminMenusApi, MenuNode } from './menus.api';
import { Role, RolesApi } from '../roles/roles.api';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, ModalComponent, EmptyComponent, SpinnerComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text tracking-tight">Menús</h1>
          <p class="text-sm text-text-muted mt-0.5">Estructura jerárquica de navegación. Asigna cada menú a uno o más roles.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="openCreate(null)">Nueva sección</app-button>
      </header>

      <div class="rounded-xl border border-border bg-surface">
        @if (loading()) {
          <div class="py-10 text-center"><app-spinner [size]="24" /></div>
        } @else if (!tree().length) {
          <app-empty title="Sin menús" description="Aún no hay menús configurados." />
        } @else {
          <ul class="divide-y divide-border">
            @for (root of tree(); track root.id) {
              <ng-container *ngTemplateOutlet="nodeTpl; context: { $implicit: root, depth: 0 }"></ng-container>
            }
          </ul>
        }
      </div>

      <ng-template #nodeTpl let-node let-depth="depth">
        <li>
          <div class="flex items-center gap-2 px-3 py-2.5 hover:bg-surface-hover group" [style.paddingLeft.px]="12 + depth * 22">
            @if (node.children?.length) {
              <button class="h-6 w-6 inline-flex items-center justify-center text-text-muted hover:text-text" (click)="toggle(node.id)">
                <lucide-icon [img]="isOpen(node.id) ? down : right" [size]="14"></lucide-icon>
              </button>
            } @else {
              <span class="w-6 inline-flex justify-center text-text-soft">
                @if (depth > 0) { <lucide-icon [img]="branchIcon" [size]="12"></lucide-icon> }
              </span>
            }

            <span class="h-7 w-7 rounded-md bg-surface-muted text-text-muted inline-flex items-center justify-center shrink-0">
              <lucide-icon [img]="resolveIcon(node.icon)" [size]="14"></lucide-icon>
            </span>

            <span class="flex-1 min-w-0">
              <span class="text-sm font-medium text-text">{{ node.name }}</span>
              <span class="ml-2 text-[10px] font-mono text-text-muted bg-surface-muted px-1.5 py-0.5 rounded">{{ node.code }}</span>
              @if (node.route) {
                <span class="ml-2 text-[11px] text-text-muted">{{ node.route }}</span>
              } @else {
                <span class="ml-2 text-[11px] text-text-soft italic">grupo</span>
              }
            </span>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="h-7 w-7 rounded-md text-text-muted hover:bg-surface-muted hover:text-text inline-flex items-center justify-center"
                      (click)="openCreate(node)" title="Añadir hijo">
                <lucide-icon [img]="plusIcon" [size]="14"></lucide-icon>
              </button>
              <button class="h-7 w-7 rounded-md text-text-muted hover:bg-surface-muted hover:text-text inline-flex items-center justify-center"
                      (click)="openRoles(node)" title="Asignar roles">
                <lucide-icon [img]="shieldIcon" [size]="14"></lucide-icon>
              </button>
              <button class="h-7 w-7 rounded-md text-text-muted hover:bg-surface-muted hover:text-primary-600 inline-flex items-center justify-center"
                      (click)="openEdit(node)" title="Editar">
                <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
              </button>
              <button class="h-7 w-7 rounded-md text-text-muted hover:bg-surface-muted hover:text-rose-600 inline-flex items-center justify-center"
                      (click)="askDelete(node)" title="Eliminar">
                <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          </div>

          @if (node.children?.length && isOpen(node.id)) {
            <ul>
              @for (child of node.children; track child.id) {
                <ng-container *ngTemplateOutlet="nodeTpl; context: { $implicit: child, depth: depth + 1 }"></ng-container>
              }
            </ul>
          }
        </li>
      </ng-template>

      <!-- Create / edit modal -->
      <app-modal [open]="!!editing()" [title]="modalTitle()" size="lg" (onClose)="closeEditor()">
        @if (editing()) {
          <app-dynamic-form [schema]="schema()" [model]="editing()!" [submitting]="saving()" (submitValue)="onSubmit($event)" />
        }
      </app-modal>

      <!-- Roles assignment modal -->
      <app-modal [open]="!!rolesFor()" [title]="rolesFor()?.name + ' · roles'" size="md" (onClose)="closeRoles()">
        @if (rolesFor()) {
          @if (loadingRoles()) {
            <div class="py-10 text-center"><app-spinner [size]="24" /></div>
          } @else {
            <div class="space-y-2">
              <p class="text-xs text-text-muted">Marca los roles que verán este menú.</p>
              @for (r of allRoles(); track r.id) {
                <label class="flex items-start gap-2 p-2.5 rounded-md border border-border hover:bg-surface-hover cursor-pointer">
                  <input type="checkbox" class="mt-0.5 accent-primary-500"
                         [checked]="selectedRoles().has(r.id)"
                         (change)="toggleRole(r.id, $any($event.target).checked)" />
                  <span class="min-w-0">
                    <span class="block text-sm font-medium text-text">{{ r.name }}</span>
                    <span class="block text-[11px] text-text-muted font-mono">{{ r.code }}</span>
                  </span>
                </label>
              }
            </div>
          }
        }
        @if (rolesFor()) {
          <div modalFooter class="px-5 py-3 border-t border-border flex justify-end gap-2 bg-surface-muted">
            <app-button variant="ghost" (onClick)="closeRoles()">Cancelar</app-button>
            <app-button [loading]="savingRoles()" (onClick)="saveRoles()">Guardar</app-button>
          </div>
        }
      </app-modal>
    </div>
  `,
})
export class AdminMenusPage {
  private readonly api = inject(AdminMenusApi);
  private readonly rolesApi = inject(RolesApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly plusIcon = Plus;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly shieldIcon = Shield;
  protected readonly down = ChevronDown;
  protected readonly right = ChevronRight;
  protected readonly branchIcon = CornerDownRight;
  protected readonly resolveIcon = resolveIcon;

  readonly tree = signal<MenuNode[]>([]);
  readonly loading = signal(false);
  private readonly openMap = signal<Record<string, boolean>>({});

  // Editor
  readonly editing = signal<(Partial<MenuNode> & { _mode?: 'create' | 'edit' }) | null>(null);
  readonly saving = signal(false);
  readonly modalTitle = computed(() => this.editing()?._mode === 'create' ? 'Nuevo menú' : 'Editar menú');

  readonly schema = computed<FormSchema>(() => {
    const e = this.editing();
    const flatOptions: Option[] = this.flatten(this.tree())
      .filter(n => n.id !== e?.id) // no permitir self-parent
      .map(n => ({ value: n.id, label: `${n.name} (${n.code})` }));
    return {
      cols: 12,
      fields: [
        { key: 'code', type: 'text', label: 'Código', width: 'half',
          validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas, números y _' }] },
        { key: 'name', type: 'text', label: 'Nombre', width: 'half', validators: ['required'] },
        { key: 'icon', type: 'text', label: 'Icono (lucide)', width: 'half', placeholder: 'shield, users, list-tree…',
          hint: 'Nombre en kebab-case, ver lucide.dev' },
        { key: 'displayOrder', type: 'number', label: 'Orden', width: 'half', defaultValue: 1, validators: ['required'] },
        { key: 'route', type: 'text', label: 'Ruta', width: 'full', placeholder: '/admin/algo  ·  vacío para grupo' },
        { key: 'parentId', type: 'select', label: 'Padre', width: 'full',
          placeholder: 'Sin padre (sección raíz)',
          options: [{ value: null as any, label: '— sin padre —' }, ...flatOptions] },
      ],
    };
  });

  // Roles
  readonly rolesFor = signal<MenuNode | null>(null);
  readonly allRoles = signal<Role[]>([]);
  readonly selectedRoles = signal<Set<string>>(new Set());
  readonly loadingRoles = signal(false);
  readonly savingRoles = signal(false);

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.tree().subscribe({
      next: t => { this.tree.set(t || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isOpen(id: string): boolean {
    const o = this.openMap();
    return id in o ? o[id] : true;
  }
  toggle(id: string) { this.openMap.update(o => ({ ...o, [id]: !this.isOpen(id) })); }

  openCreate(parent: MenuNode | null) {
    const siblings = parent ? parent.children : this.tree();
    const nextOrder = (siblings?.length ?? 0) + 1;
    this.editing.set({ _mode: 'create', parentId: parent?.id ?? null, displayOrder: nextOrder, enabled: true });
  }

  openEdit(n: MenuNode) {
    this.editing.set({ _mode: 'edit', ...n });
  }

  closeEditor() { this.editing.set(null); }

  onSubmit(v: any) {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    const payload = {
      code: v.code, name: v.name, icon: v.icon ?? null, route: v.route || null,
      parentId: v.parentId || null, displayOrder: Number(v.displayOrder ?? 1),
    };
    const obs = e.id ? this.api.update(e.id, payload) : this.api.create(payload);
    obs.subscribe({
      next: () => { this.toast.success('Guardado'); this.saving.set(false); this.closeEditor(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(n: MenuNode) {
    const hasKids = n.children?.length > 0;
    const ok = await this.confirm.ask({
      title: 'Eliminar menú',
      message: hasKids
        ? `"${n.name}" tiene ${n.children.length} sub-menú(s). Se eliminarán también. ¿Continuar?`
        : `¿Eliminar "${n.name}"?`,
      tone: 'danger', confirmText: 'Eliminar',
    });
    if (!ok) return;
    this.api.remove(n.id).subscribe({
      next: () => { this.toast.success('Eliminado'); this.refresh(); },
    });
  }

  openRoles(n: MenuNode) {
    this.rolesFor.set(n);
    this.loadingRoles.set(true);
    Promise.all([
      new Promise<Role[]>(res => this.rolesApi.list().subscribe({ next: res, error: () => res([]) })),
      new Promise<string[]>(res => this.api.rolesOf(n.id).subscribe({ next: res, error: () => res([]) })),
    ]).then(([all, current]) => {
      this.allRoles.set(all);
      this.selectedRoles.set(new Set(current));
      this.loadingRoles.set(false);
    });
  }

  closeRoles() { this.rolesFor.set(null); this.allRoles.set([]); this.selectedRoles.set(new Set()); }

  toggleRole(id: string, on: boolean) {
    this.selectedRoles.update(s => {
      const next = new Set(s);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  }

  saveRoles() {
    const r = this.rolesFor();
    if (!r) return;
    this.savingRoles.set(true);
    this.api.setRoles(r.id, Array.from(this.selectedRoles())).subscribe({
      next: () => { this.toast.success('Roles asignados'); this.savingRoles.set(false); this.closeRoles(); },
      error: () => this.savingRoles.set(false),
    });
  }

  private flatten(nodes: MenuNode[]): MenuNode[] {
    const out: MenuNode[] = [];
    const walk = (ns: MenuNode[]) => ns.forEach(n => { out.push(n); if (n.children?.length) walk(n.children); });
    walk(nodes);
    return out;
  }
}
