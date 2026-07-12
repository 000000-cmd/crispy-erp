import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Plus, UploadCloud, Link2, Rocket, Trash2 } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DataTableComponent } from '../../../shared/table/data-table.component';
import { ColumnDef, RowAction } from '../../../shared/table/data-table.types';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

import { AppVersionsApi } from './app-versions.api';
import { AppVersion } from './app-versions.model';
import { UploadForm, EMPTY_UPLOAD_FORM } from './app-versions.form';

/**
 * Distribución del APK (admin del sistema): subir versiones, publicarlas como
 * vigentes y llevar el histórico. Publicar sincroniza VERAPP y actualiza el
 * link estable de descarga que comparten los dueños.
 */
@Component({
  selector: 'app-admin-app-versions',
  standalone: true,
  imports: [
    CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent, DataTableComponent,
    FieldComponent, InputComponent, SwitchComponent, TPipe, PageHeaderComponent,
  ],
  templateUrl: './app-versions.component.html',
})
export class AdminAppVersionsComponent {
  private readonly api = inject(AppVersionsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;
  protected readonly uploadIcon = UploadCloud;
  protected readonly linkIcon = Link2;

  readonly items = signal<AppVersion[]>([]);
  readonly loading = signal(false);
  readonly open = signal(false);
  readonly saving = signal(false);
  readonly form = signal<UploadForm>({ ...EMPTY_UPLOAD_FORM });

  readonly formValid = computed(() => {
    const f = this.form();
    return !!f.file && /^\d+\.\d+\.\d+$/.test(f.version) && /^\d+$/.test(f.versionCode) && Number(f.versionCode) > 0;
  });

  readonly columns = computed<ColumnDef<AppVersion>[]>(() => {
    void this.i18n.dict();
    return [
      { key: 'version', label: this.i18n.t('admin.appVersions.col.version'), width: '110px' },
      { key: 'versionCode', label: this.i18n.t('admin.appVersions.col.code'), width: '90px', align: 'center' },
      { key: 'sizeBytes', label: this.i18n.t('admin.appVersions.col.size'), width: '110px', align: 'right', format: r => this.mb(r.sizeBytes) },
      { key: 'checksum', label: this.i18n.t('admin.appVersions.col.checksum'), format: r => r.checksum.slice(0, 16) + '…' },
      { key: 'createdDate', label: this.i18n.t('admin.appVersions.col.uploaded'), width: '170px', format: r => (r.createdDate ?? '').replace('T', ' ').slice(0, 16) },
      {
        key: 'isCurrent', label: this.i18n.t('admin.appVersions.col.status'), align: 'center', width: '110px',
        tag: r => r.isCurrent
          ? { label: this.i18n.t('admin.appVersions.current'), tone: 'primary' }
          : { label: this.i18n.t('admin.appVersions.historic'), tone: 'neutral' },
      },
    ];
  });

  readonly actions = computed<RowAction<AppVersion>[]>(() => {
    void this.i18n.dict();
    return [
      { icon: Rocket, label: this.i18n.t('admin.appVersions.publish'), tone: 'primary', show: r => !r.isCurrent, onClick: r => this.publish(r) },
      { icon: Link2, label: this.i18n.t('admin.appVersions.copyLink'), tone: 'neutral', onClick: r => this.copyLink(r) },
      { icon: Trash2, label: this.i18n.t('admin.appVersions.delete'), tone: 'danger', show: r => !r.isCurrent, onClick: r => this.askDelete(r) },
    ];
  });

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: v => { this.items.set(v); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  patch<K extends keyof UploadForm>(key: K, value: UploadForm[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  onFile(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0] ?? null;
    this.patch('file', file);
    // Sugerir la versión desde el nombre (saas-app-1.0.1.apk → 1.0.1).
    const m = file?.name.match(/(\d+\.\d+\.\d+)/);
    if (m && !this.form().version) this.patch('version', m[1]);
  }

  openUpload() { this.form.set({ ...EMPTY_UPLOAD_FORM }); this.open.set(true); }
  close() { this.open.set(false); }

  submit() {
    const f = this.form();
    if (!this.formValid() || !f.file) return;
    this.saving.set(true);
    this.api.upload({
      file: f.file, version: f.version.trim(), versionCode: Number(f.versionCode),
      notes: f.notes.trim() || undefined, publish: f.publish,
    }).subscribe({
      next: v => {
        this.toast.success(this.i18n.t(
          v.isCurrent ? 'admin.appVersions.toast.published' : 'admin.appVersions.toast.uploaded',
          { version: v.version },
        ));
        this.saving.set(false);
        this.close();
        this.refresh();
      },
      error: () => this.saving.set(false),
    });
  }

  publish(v: AppVersion) {
    this.api.publish(v.id).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('admin.appVersions.toast.published', { version: v.version }));
        this.refresh();
      },
    });
  }

  copyLink(v: AppVersion) {
    const url = v.isCurrent ? this.api.latestDownloadUrl() : this.api.downloadUrl(v.id);
    navigator.clipboard.writeText(url)
      .then(() => this.toast.success(this.i18n.t('admin.appVersions.toast.linkCopied')));
  }

  copyLatestLink() {
    navigator.clipboard.writeText(this.api.latestDownloadUrl())
      .then(() => this.toast.success(this.i18n.t('admin.appVersions.toast.stableLinkCopied')));
  }

  async askDelete(v: AppVersion) {
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.appVersions.delete.title'),
      message: this.i18n.t('admin.appVersions.delete.message', { version: v.version }),
      tone: 'danger',
      confirmText: this.i18n.t('admin.appVersions.delete'),
    });
    if (!ok) return;
    this.api.remove(v.id).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('admin.appVersions.toast.deleted'));
        this.refresh();
      },
    });
  }

  fileLabel(): string {
    return this.form().file?.name ?? this.i18n.t('admin.appVersions.form.filePick');
  }

  private mb(bytes: number): string { return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
}
