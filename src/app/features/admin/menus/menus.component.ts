import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, Shield, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { resolveIcon } from '../../../layouts/shell/icon-resolver';
import { AdminMenusApi, MenuNode } from './menus.api';
import { Role, RolesApi } from '../roles/roles.api';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CheckboxComponent, DrawerComponent, EmptyComponent, SpinnerComponent, DynamicFormComponent, TPipe],
  templateUrl: './menus.component.html',
})
export class AdminMenusComponent {
  private readonly api = inject(AdminMenusApi);
  private readonly rolesApi = inject(RolesApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

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
  readonly dirty = signal(false);

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }
  readonly modalTitle = computed(() => {
    void this.i18n.dict();
    return this.editing()?._mode === 'create' ? this.i18n.t('admin.menus.newTitle') : this.i18n.t('admin.menus.editTitle');
  });

  readonly schema = computed<FormSchema>(() => {
    const e = this.editing();
    const flatOptions: Option[] = this.flatten(this.tree())
      .filter(n => n.id !== e?.id) // no permitir self-parent
      .map(n => ({ value: n.id, label: `${n.name} (${n.code})` }));
    return {
      cols: 12,
      submit: { show: false },
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
    this.dirty.set(false);
    this.editing.set({ _mode: 'create', parentId: parent?.id ?? null, displayOrder: nextOrder, enabled: true });
  }

  openEdit(n: MenuNode) {
    this.dirty.set(false);
    this.editing.set({ _mode: 'edit', ...n });
  }

  closeEditor() { this.editing.set(null); this.dirty.set(false); }

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
      next: () => { this.toast.success(this.i18n.t('admin.menus.toast.saved')); this.saving.set(false); this.closeEditor(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(n: MenuNode) {
    const hasKids = n.children?.length > 0;
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.menus.delete.title'),
      message: hasKids
        ? this.i18n.t('admin.menus.delete.withChildren', { name: n.name, count: n.children.length })
        : this.i18n.t('admin.menus.delete.message', { name: n.name }),
      tone: 'danger', confirmText: this.i18n.t('common.delete'),
    });
    if (!ok) return;
    this.api.remove(n.id).subscribe({
      next: () => { this.toast.success(this.i18n.t('admin.menus.toast.deleted')); this.refresh(); },
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
      next: () => { this.toast.success(this.i18n.t('admin.menus.toast.rolesSaved')); this.savingRoles.set(false); this.closeRoles(); },
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
