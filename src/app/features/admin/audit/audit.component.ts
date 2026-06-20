import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, RefreshCw, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { AuditApi, AuditAction, AuditLog, AuditFilters } from './audit.api';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LucideAngularModule,
    ButtonComponent, DrawerComponent, SpinnerComponent, EmptyComponent, DatePipe,
  ],
  templateUrl: './audit.component.html',
})
export class AdminAuditComponent {
  private readonly api = inject(AuditApi);

  protected readonly refreshIcon = RefreshCw;
  protected readonly eyeIcon = Eye;
  protected readonly prevIcon = ChevronLeft;
  protected readonly nextIcon = ChevronRight;
  protected readonly filterIcon = Filter;

  readonly loading = signal(false);
  readonly rows = signal<AuditLog[]>([]);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  // Filtros (ngModel)
  readonly fType = signal('');
  readonly fAction = signal<'' | AuditAction>('');
  readonly fActor = signal('');

  readonly selected = signal<AuditLog | null>(null);

  readonly actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'TOGGLE'];

  readonly rangeLabel = computed(() => {
    const total = this.totalElements();
    if (!total) return '0';
    const start = this.page() * this.size() + 1;
    const end = Math.min(start + this.rows().length - 1, total);
    return `${start}–${end} de ${total}`;
  });

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    const filters: AuditFilters = {
      page: this.page(),
      size: this.size(),
      aggregateType: this.fType() || undefined,
      action: this.fAction() || undefined,
      actorId: this.fActor() || undefined,
    };
    this.api.list(filters).subscribe({
      next: (r) => {
        this.rows.set(r.content ?? []);
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 0);
        this.loading.set(false);
      },
      error: () => { this.rows.set([]); this.loading.set(false); },
    });
  }

  applyFilters() { this.page.set(0); this.load(); }
  clearFilters() {
    this.fType.set(''); this.fAction.set(''); this.fActor.set('');
    this.page.set(0); this.load();
  }

  prev() { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  next() { if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); } }

  open(row: AuditLog) { this.selected.set(row); }
  close() { this.selected.set(null); }

  // --- Visuales ---
  actionClass(a: AuditAction): string {
    switch (a) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200';
      case 'UPDATE': return 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200';
      case 'TOGGLE': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200';
      default:       return 'bg-surface-muted text-text-muted';
    }
  }
  actionLabel(a: AuditAction): string {
    return { CREATE: 'Creó', UPDATE: 'Editó', TOGGLE: 'Cambió estado', DELETE: 'Eliminó' }[a] ?? a;
  }
  shortId(id?: string | null): string {
    return id ? id.slice(0, 8) : '—';
  }
  pretty(value: any): string {
    if (value === null || value === undefined) return '—';
    try { return JSON.stringify(value, null, 2); }
    catch { return String(value); }
  }
}
