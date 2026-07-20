import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import {
  LucideAngularModule, Wallet, Hourglass, ClipboardClock, CheckCircle2,
  Info, ArrowRight, Banknote, History, Filter,
} from 'lucide-angular';

import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption } from '../../../shared/ui/autocomplete/autocomplete.types';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MascotComponent } from '../../../shared/ui/mascot/mascot.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';
import { formatCOP } from '../../../shared/util/money';
import { assetUrl } from '../../public-site/landing.model';

import { SedesApi } from '../sedes/sedes.api';
import { Branch } from '../sedes/sedes.model';
import { EmpleadosApi } from '../empleados/empleados.api';
import { EmployeeDetail } from '../empleados/empleados.model';
import { SettlementApi } from './settlement.api';
import { EmployeeBalance, Settlement, SettlementRow } from './settlement.model';

/**
 * Liquidación y cierre: el dueño confirma lo que le debe a cada colaborador y
 * el monto se transfiere a su saldo individual.
 *
 * Los SALDOS se leen del read model de Elasticsearch (rápido, no toca la BD
 * transaccional) y se cruzan con los empleados por sede para resolver la
 * persona. Confirmar va contra finance-service, que es quien mueve el dinero.
 *
 * "Ver detalles" (desglose servicio a servicio de la comisión) queda PENDIENTE:
 * depende del módulo de citas/servicios prestados, que aún no existe. Por la
 * misma razón el devengado llega en 0 hasta que ese módulo alimente el saldo;
 * la pantalla lo muestra tal cual en vez de inventar cifras.
 */
@Component({
  selector: 'app-tenant-liquidaciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LucideAngularModule, SkeletonComponent,
    AutocompleteComponent, ModalComponent, MascotComponent,
  ],
  templateUrl: './liquidaciones.component.html',
})
export class LiquidacionesComponent {
  private readonly api = inject(SettlementApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly empleadosApi = inject(EmpleadosApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly walletIcon = Wallet;
  protected readonly hourglassIcon = Hourglass;
  protected readonly pendingIcon = ClipboardClock;
  protected readonly checkIcon = CheckCircle2;
  protected readonly infoIcon = Info;
  protected readonly arrowIcon = ArrowRight;
  protected readonly moneyIcon = Banknote;
  protected readonly historyIcon = History;
  protected readonly filterIcon = Filter;
  protected readonly fmt = formatCOP;
  protected readonly assetUrl = assetUrl;

  readonly businessId = signal<string | null>(this.auth.user()?.businessId ?? null);
  readonly loading = signal(true);
  readonly branches = signal<Branch[]>([]);
  /** Filtro de sede. null = toda la empresa. */
  readonly branchFilter = signal<string | null>(null);
  readonly settlingId = signal<string | null>(null);

  private readonly balances = signal<EmployeeBalance[]>([]);
  private readonly employees = signal<EmployeeDetail[]>([]);
  private readonly positionName = signal(new Map<string, string>());

  // ---- Historial (auditoría) ----
  readonly showHistory = signal(false);
  readonly history = signal<Settlement[]>([]);

  readonly branchOptions = computed<AutocompleteOption[]>(() =>
    this.branches().map(b => ({ value: b.id, label: b.name })));

  private readonly branchName = computed(() =>
    new Map(this.branches().map(b => [b.id, b.name])));

  /** Filas del listado: saldo (ES) + persona (business), cruzados por empleado. */
  readonly rows = computed<SettlementRow[]>(() => {
    const byEmployee = new Map(this.employees().map(e => [e.id, e]));
    const branches = this.branchName();
    const positions = this.positionName();
    return this.balances().map(b => {
      const emp = byEmployee.get(b.employeeId);
      return {
        employeeId: b.employeeId,
        personName: emp?.personName?.trim() || 'Pendiente de completar',
        photoUrl: emp?.photoUrl ?? null,
        branchId: b.branchId,
        branchName: (b.branchId && branches.get(b.branchId)) || 'Sin sede',
        positionName: (emp?.positionId && positions.get(emp.positionId)) || 'Cargo pendiente',
        accrued: b.amountAccrued ?? 0,
        paid: b.amountPaid ?? 0,
        pending: b.balance ?? 0,
        currency: b.currency || 'COP',
      };
    }).sort((a, b) => b.pending - a.pending);
  });

  /** Solo quienes tienen algo por cobrar: son los que se pueden liquidar. */
  readonly payableRows = computed(() => this.rows().filter(r => r.pending > 0));
  readonly pendingCount = computed(() => this.payableRows().length);
  readonly totalPending = computed(() => this.rows().reduce((a, r) => a + r.pending, 0));
  readonly totalAccrued = computed(() => this.rows().reduce((a, r) => a + r.accrued, 0));
  readonly totalPaid = computed(() => this.rows().reduce((a, r) => a + r.paid, 0));
  /** Aún no hay devengado: el módulo de citas todavía no alimenta el saldo. */
  readonly awaitingAppointments = computed(() => this.totalAccrued() === 0);

  constructor() {
    const businessId = this.businessId();
    if (!businessId) { this.loading.set(false); return; }

    this.sedesApi.list(businessId).subscribe({
      next: b => { this.branches.set(b); this.loadEmployees(b); },
      error: () => this.loading.set(false),
    });
    this.systemListsApi.itemsEnabled('employee_position').pipe(
      map((items: CatalogItem[]) => new Map(items.map(i => [i.id, i.name]))),
    ).subscribe({ next: m => this.positionName.set(m) });

    this.reloadBalances();
  }

  /** Los empleados se listan por sede; se unen todas para cruzar con los saldos. */
  private loadEmployees(branches: Branch[]) {
    if (!branches.length) { this.loading.set(false); return; }
    forkJoin(branches.map(b => this.empleadosApi.listDetailed(b.id)))
      .subscribe({
        next: lists => { this.employees.set(lists.flat()); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  reloadBalances() {
    const businessId = this.businessId();
    if (!businessId) return;
    this.api.balances(businessId, this.branchFilter()).subscribe({
      next: b => this.balances.set(b),
    });
  }

  /**
   * Aplica en local el efecto de una liquidación confirmada.
   *
   * NO se recarga desde Elasticsearch tras confirmar: el read model es
   * eventualmente consistente (proyección por evento) y una lectura inmediata
   * devuelve el saldo VIEJO, haciendo creer que la confirmación falló. El back
   * ya validó y movió el dinero, así que el efecto es conocido y se refleja de
   * una vez; la próxima carga de la pantalla reconcilia con el read model.
   */
  private applySettled(employeeId: string, amount: number) {
    this.balances.update(list => list.map(b => b.employeeId === employeeId
      ? { ...b, amountPaid: (b.amountPaid ?? 0) + amount, balance: (b.balance ?? 0) - amount }
      : b));
  }

  onBranchFilter(branchId: string | null) {
    this.branchFilter.set(branchId);
    this.reloadBalances();
  }

  /** Confirmar es IRREVERSIBLE: se pide confirmación explícita con el monto. */
  async settle(row: SettlementRow) {
    const ok = await this.confirm.ask({
      title: 'Confirmar y liquidar',
      message: `Se transferirán ${formatCOP(row.pending)} al saldo individual de ${row.personName}. `
        + 'Esta operación es irreversible y queda registrada en la auditoría.',
      confirmText: 'Confirmar y liquidar',
      tone: 'primary',
    });
    if (!ok) return;

    this.settlingId.set(row.employeeId);
    this.api.settle({ employeeId: row.employeeId }).subscribe({
      next: s => {
        this.settlingId.set(null);
        this.applySettled(row.employeeId, s.amount);
        this.toast.success(`Liquidación confirmada para ${row.personName}`);
      },
      error: () => this.settlingId.set(null),
    });
  }

  /** Liquida a TODOS los que tienen saldo, en una sola confirmación. */
  async settleAll() {
    const rows = this.payableRows();
    if (!rows.length) return;
    const ok = await this.confirm.ask({
      title: 'Liquidar todo',
      message: `Se liquidarán ${rows.length} colaborador(es) por un total de ${formatCOP(this.totalPending())}. `
        + 'Esta operación es irreversible y queda registrada en la auditoría.',
      confirmText: 'Liquidar todo',
      tone: 'primary',
    });
    if (!ok) return;

    this.settlingId.set('all');
    forkJoin(rows.map(r => this.api.settle({ employeeId: r.employeeId }))).subscribe({
      next: settled => {
        this.settlingId.set(null);
        settled.forEach(s => this.applySettled(s.employeeId, s.amount));
        this.toast.success(`${rows.length} liquidación(es) confirmada(s)`);
      },
      // Si alguna falló, el estado local ya no es confiable: se relee del origen.
      error: () => { this.settlingId.set(null); this.reloadBalances(); },
    });
  }

  openHistory() {
    const businessId = this.businessId();
    if (!businessId) return;
    this.showHistory.set(true);
    this.api.history(businessId).subscribe({ next: h => this.history.set(h) });
  }

  /** Nombre de la persona en el historial (el back solo guarda el employeeId). */
  personOf(employeeId: string): string {
    return this.rows().find(r => r.employeeId === employeeId)?.personName ?? 'Colaborador';
  }

  initials(name: string): string {
    const n = name?.trim();
    if (!n) return '?';
    return n.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
  }
}
