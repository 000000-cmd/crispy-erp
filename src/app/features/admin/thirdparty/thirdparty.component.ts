import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Eye, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-angular';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';

import { ColumnDef, DataTableComponent, RowAction } from '../../../shared/table/data-table.component';

import { ThirdPartyApi } from './thirdparty.api';
import { ThirdParty, ThirdPartyDetail } from './thirdparty.model';
import { SystemListsApi } from '../system-lists/system-lists.api';
import { buildThirdPartySchema } from './thirdparty-form';
import { ThirdPartyRelationsComponent } from './relations/thirdparty-relations.component';

@Component({
  selector: 'app-admin-third-parties',
  standalone: true,
  imports: [
    CommonModule, ButtonComponent, DrawerComponent,
    DataTableComponent, DynamicFormComponent, TagComponent, PaginatorComponent, TPipe,
    SearchFieldComponent, ThirdPartyRelationsComponent,
  ],
  templateUrl: './thirdparty.component.html',
})
export class ThirdPartyComponent {
  private readonly api = inject(ThirdPartyApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);

  protected readonly plusIcon = Plus;

  readonly thirdParties = signal<ThirdParty[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<Partial<ThirdParty> | null>(null);
  readonly dirty = signal(false);

  // Búsqueda (Elastic) + paginación server-side
  readonly query = signal('');
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalHits = signal(0);
  readonly totalPages = signal(0);
  private readonly search$ = new Subject<string>();

  // Visualizar (solo lectura, info anidada)
  readonly detail = signal<ThirdPartyDetail | null>(null);
  readonly viewing = signal(false);
  readonly loadingDetail = signal(false);

  // Reindex: compara el documento COMPLETO en ES (base + contactos + direcciones)
  // vs el mismo detalle en BD (/full). Si difieren, ES está desactualizado.
  readonly reindexOpen = signal(false);
  readonly reindexing = signal(false);
  readonly loadingCompare = signal(false);
  readonly elasticDoc = signal<Record<string, unknown> | null>(null);
  readonly dbFull = signal<ThirdPartyDetail | null>(null);
  readonly reindexStale = computed(() => {
    const es = this.elasticDoc(), db = this.dbFull();
    if (!db) return false;
    if (!es) return true; // no indexado todavía
    return JSON.stringify(this.esCanon(es)) !== JSON.stringify(this.dbCanon(db));
  });
  private reindexTargetId = '';

  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly schema = computed(() => {
    const editing = this.editing();
    if (!editing) return null;
    const schema = buildThirdPartySchema(this.systemListsApi, editing.id ? 'edit' : 'create');
    return { ...schema, submit: { ...(schema.submit ?? {}), show: false } };
  });

  readonly columns = computed<ColumnDef<ThirdParty>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'documentNumber', label: 'Documento', width: '160px' },
      {
        key: 'fullName' as any, label: 'Nombre',
        format: r => r.fullName ?? [r.firstName, r.secondName, r.firstLastName, r.secondLastName].filter(Boolean).join(' '),
      },
      {
        key: 'enabled', label: 'Habilitado', align: 'center', width: '120px',
        tag: r => r.enabled
          ? { label: this.i18n.t('common.active'), tone: 'success' }
          : { label: this.i18n.t('common.inactive'), tone: 'neutral' },
      },
    ];
  });

  readonly actions = computed<RowAction<ThirdParty>[]>(() => {
    void this.i18n.dict();
    return [
      { icon: Eye, label: this.i18n.t('common.view'), tone: 'neutral', onClick: r => this.openView(r) },
      { icon: Pencil, label: this.i18n.t('common.edit'), tone: 'primary', onClick: r => this.openEdit(r) },
      {
        icon: RefreshCcw, label: 'Reindexar', tone: 'neutral',
        show: () => this.auth.hasPermission('THIRDPARTY_REINDEX'),
        onClick: r => this.openReindex(r),
      },
      { icon: Trash2, label: this.i18n.t('common.delete'), tone: 'danger', onClick: r => this.askDelete(r) },
    ];
  });

  constructor() {
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.query.set(q.trim());
      this.page.set(0);
      this.refresh();
    });
    this.refresh();
  }

  /** GET principal + buscador: consume Elasticsearch paginado. */
  refresh() {
    this.loading.set(true);
    this.api.search({ q: this.query() || undefined, page: this.page(), size: this.size() }).subscribe({
      next: res => {
        this.thirdParties.set(res.items);
        this.totalHits.set(res.totalHits);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(value: string) { this.search$.next(value); }
  onPage(p: number) { this.page.set(p); this.refresh(); }

  openCreate() { this.dirty.set(false); this.editing.set({}); }

  /** Editar: carga la entidad COMPLETA desde thirdparty-service (no el doc de Elastic). */
  openEdit(row: ThirdParty) {
    this.dirty.set(false);
    this.api.get(row.id).subscribe({ next: full => this.editing.set({ ...full }) });
  }

  close() { this.editing.set(null); this.dirty.set(false); }

  openView(item: ThirdParty) {
    this.viewing.set(true);
    this.loadingDetail.set(true);
    this.detail.set(null);
    this.api.getFull(item.id).subscribe({
      next: d => { this.detail.set(d); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }
  closeView() { this.viewing.set(false); this.detail.set(null); }

  /** Abre el comparador: documento COMPLETO en ES vs el mismo detalle en BD. */
  openReindex(item: ThirdParty) {
    this.reindexTargetId = item.id;
    this.reindexOpen.set(true);
    this.reindexing.set(false);
    this.loadingCompare.set(true);
    this.elasticDoc.set(null);
    this.dbFull.set(null);
    forkJoin({
      elastic: this.api.searchDoc(item.id),
      db: this.api.getFull(item.id),
    }).subscribe({
      next: ({ elastic, db }) => {
        this.elasticDoc.set(elastic);
        this.dbFull.set(db);
        this.loadingCompare.set(false);
      },
      error: () => this.loadingCompare.set(false),
    });
  }

  // Forma canónica común (base + hijos ordenados) para comparar ES vs BD
  // ignorando metadatos de ES (score, docVersion, updatedAt) y el orden de listas.
  private esCanon(doc: Record<string, unknown>): unknown {
    const d = doc as any;
    return this.canon(d.documentNumber, d.documentTypeId, d.fullName, d.genderId, d.enabled, d.contacts, d.addresses);
  }
  private dbCanon(detail: ThirdPartyDetail): unknown {
    const t = detail.thirdParty as any;
    return this.canon(t.documentNumber, t.documentTypeId, t.fullName, t.genderId, t.enabled, detail.contacts, detail.addresses);
  }
  private canon(documentNumber: unknown, documentTypeId: unknown, fullName: unknown,
                genderId: unknown, enabled: unknown, contacts: any[] = [], addresses: any[] = []): unknown {
    const byId = (a: any, b: any) => String(a.id ?? '').localeCompare(String(b.id ?? ''));
    return {
      documentNumber: documentNumber ?? null,
      documentTypeId: documentTypeId ?? null,
      fullName: fullName ?? null,
      genderId: genderId ?? null,
      enabled: !!enabled,
      contacts: (contacts ?? []).slice().sort(byId).map(c => ({
        contactTypeId: c.contactTypeId ?? null, value: c.value ?? null,
        isPrimary: !!c.isPrimary, isVerified: !!c.isVerified,
      })),
      addresses: (addresses ?? []).slice().sort(byId).map(a => ({
        addressTypeId: a.addressTypeId ?? null, municipalityId: a.municipalityId ?? null,
        neighborhoodId: a.neighborhoodId ?? null, line: a.line ?? null, isPrimary: !!a.isPrimary,
      })),
    };
  }

  confirmReindex() {
    if (!this.reindexTargetId) return;
    this.reindexing.set(true);
    this.api.reindex(this.reindexTargetId).subscribe({
      next: () => {
        this.toast.success('Tercero reindexado correctamente');
        this.reindexing.set(false);
        this.closeReindex();
        this.refresh();
      },
      error: () => this.reindexing.set(false),
    });
  }

  closeReindex() { this.reindexOpen.set(false); this.elasticDoc.set(null); this.dbFull.set(null); }

  onSubmit(value: any) {
    const editing = this.editing();
    if (!editing) return;
    this.saving.set(true);

    const payload = {
      documentTypeId: value.documentTypeId,
      documentNumber: value.documentNumber,
      firstName: value.firstName,
      secondName: value.secondName,
      firstLastName: value.firstLastName,
      secondLastName: value.secondLastName,
      genderId: value.genderId || null,
      birthDate: value.birthDate || null,
      photoUrl: value.photoUrl || null,
    };

    const done = (msg: string) => { this.toast.success(msg); this.saving.set(false); this.close(); this.refresh(); };

    if (!editing.id) {
      this.api.create(payload).subscribe({ next: () => done('Tercero creado correctamente'), error: () => this.saving.set(false) });
    } else {
      this.api.update(editing.id, payload).subscribe({ next: () => done('Tercero actualizado correctamente'), error: () => this.saving.set(false) });
    }
  }

  /** Eliminar = soft-delete en el backend (enabled/visible=false). */
  async askDelete(item: ThirdParty) {
    const ok = await this.confirm.ask({
      title: 'Eliminar tercero',
      message: `¿Desea eliminar el tercero "${item.documentNumber}"?`,
      confirmText: this.i18n.t('common.delete'),
      tone: 'danger',
    });
    if (!ok) return;
    this.api.remove(item.id).subscribe({
      next: () => { this.toast.success('Tercero eliminado correctamente'); this.refresh(); },
    });
  }
}
