import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { LucideAngularModule, Building2, MapPin, User } from 'lucide-angular';

import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption } from '../../../shared/ui/autocomplete/autocomplete.types';
import { TooltipComponent } from '../../../shared/ui/tooltip/tooltip.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';
import { SedesApi } from '../sedes/sedes.api';
import { EmpleadosApi } from '../empleados/empleados.api';
import { Branch } from '../sedes/sedes.model';
import { EmployeeDetail } from '../empleados/empleados.model';
import { assetUrl } from '../../public-site/landing.model';

import { ServiciosApi } from '../servicios/servicios.api';
import { Offering } from '../servicios/servicios.model';
import { FinanceApi } from './finance.api';
import { Compensation, CompensationDraft } from './finance.model';
import { CompLevelCardComponent } from './comp-level-card.component';
import { CompSimulationComponent } from './comp-simulation.component';

/**
 * Compensaciones del equipo. Organización pensada para ser instintiva:
 *
 *  1) LA BASE DE LA EMPRESA es el único paso obligatorio y va primero, a lo
 *     ancho. Mientras no exista, las excepciones quedan bloqueadas con un
 *     candado que explica por qué.
 *  2) Debajo, DOS EXCEPCIONES OPCIONALES e INDEPENDIENTES entre sí (no
 *     necesitas la de sede para tener la de empleado):
 *     - Por sede: elige la sede y ajusta su regla.
 *     - Por empleado: elige sede (solo para filtrar el listado) y empleado;
 *       se muestra su PERFIL (foto, cargo, sede, código) y debajo su
 *       compensación individual.
 *
 * Regla de precarga intacta: un nivel sin config propia muestra la del nivel
 * superior ("Heredada"); al guardar, el registro se crea EN ese nivel.
 */
@Component({
  selector: 'app-tenant-compensaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent, SkeletonComponent,
            AutocompleteComponent, TooltipComponent, CompLevelCardComponent, CompSimulationComponent],
  templateUrl: './compensaciones.component.html',
})
export class CompensacionesComponent {
  private readonly finance = inject(FinanceApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly empleadosApi = inject(EmpleadosApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly serviciosApi = inject(ServiciosApi);

  /** Pestaña activa (Empresa / Sede / Empleado), layout Stitch. */
  readonly tab = signal<'business' | 'branch' | 'employee'>('business');
  /** Servicios del negocio para la simulación/mini-modal (se cargan una vez). */
  readonly offerings = signal<Offering[]>([]);

  /** Borrador EN VIVO de cada nivel (lo emite el comp-level-card) + su estado dirty,
   *  para que la simulación se mueva mientras el dueño edita y muestre simulado/guardado. */
  readonly bizDraft = signal<CompensationDraft | null>(null);
  readonly bizDirtySim = signal(false);
  readonly branchDraft = signal<CompensationDraft | null>(null);
  readonly branchDirtySim = signal(false);
  readonly empDraft = signal<CompensationDraft | null>(null);
  readonly empDirtySim = signal(false);

  protected readonly bizIcon = Building2;
  protected readonly pinIcon = MapPin;
  protected readonly userIcon = User;
  protected readonly assetUrl = assetUrl;

  readonly businessId = signal<string | null>(this.auth.user()?.businessId ?? null);
  readonly branches = signal<Branch[]>([]);
  readonly branchOptions = computed<AutocompleteOption[]>(() => this.branches().map(b => ({ value: b.id, label: b.name })));
  private readonly positionName = signal(new Map<string, string>());

  // ---- Base de empresa (obligatoria, primero) ----
  readonly bizLoading = signal(true);
  readonly bizComp = signal<Compensation | null>(null);
  readonly bizSaving = signal(false);
  /** Las excepciones se desbloquean cuando existe la base. */
  readonly baseReady = computed(() => !!this.bizComp());

  // ---- Excepción por sede (opcional, independiente) ----
  readonly branchSelId = signal<string | null>(null);
  readonly branchComp = signal<Compensation | null>(null);
  readonly branchSaving = signal(false);

  // ---- Excepción por empleado (opcional, independiente) ----
  /** Sede del picker de empleado: SOLO filtra el listado (no exige config de sede). */
  readonly empBranchId = signal<string | null>(null);
  readonly employees = signal<EmployeeDetail[]>([]);
  readonly empSelId = signal<string | null>(null);
  readonly empComp = signal<Compensation | null>(null);
  /** Config propia de LA SEDE DEL EMPLEADO (para su cadena de herencia). */
  readonly empBranchComp = signal<Compensation | null>(null);
  readonly empSaving = signal(false);

  readonly employeeOptions = computed<AutocompleteOption[]>(() => this.employees().map(e => ({
    value: e.id, label: e.personName?.trim() || 'Pendiente de completar',
  })));

  readonly selectedEmployee = computed(() => this.employees().find(e => e.id === this.empSelId()) ?? null);
  readonly empBranchName = computed(() => this.branches().find(b => b.id === this.empBranchId())?.name ?? '');
  readonly empPositionName = computed(() => {
    const e = this.selectedEmployee();
    return (e?.positionId && this.positionName().get(e.positionId)) || 'Cargo pendiente';
  });
  readonly empInitials = computed(() => {
    const n = this.selectedEmployee()?.personName?.trim();
    if (!n) return '?';
    return n.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
  });

  /** El empleado hereda de SU sede si ésta tiene propia; si no, de la empresa. */
  readonly empInherited = computed(() => this.empBranchComp() ?? this.bizComp());
  readonly empInheritedFrom = computed(() => this.empBranchComp() ? 'Sede' : 'Empresa');

  // ---- Qué compensación alimenta cada simulación ----
  //
  // La tarjeta emite su borrador SIEMPRE, incluso vacío (mientras no se elige
  // sede/empleado). Un borrador sin valor no representa nada, así que se
  // descarta y se cae a lo guardado y luego a lo HEREDADO: sin esto, el
  // simulador de un nivel sin configuración propia se quedaba en ceros en vez
  // de mostrar la regla que realmente le aplica.
  private resolveSim(draft: CompensationDraft | null, own: Compensation | null, inherited: Compensation | null) {
    if (draft && draft.compensationValue != null) return draft;
    return own ?? inherited;
  }

  readonly bizSim = computed(() => this.resolveSim(this.bizDraft(), this.bizComp(), null));
  readonly branchSim = computed(() => this.resolveSim(this.branchDraft(), this.branchComp(), this.bizComp()));
  readonly empSim = computed(() => this.resolveSim(this.empDraft(), this.empComp(), this.empInherited()));

  /** De dónde sale lo que se está simulando (para rotularlo en el panel). */
  readonly branchSimSource = computed(() =>
    this.branchDirtySim() ? 'draft' : (this.branchComp() ? 'own' : 'inherited'));
  readonly empSimSource = computed(() =>
    this.empDirtySim() ? 'draft' : (this.empComp() ? 'own' : 'inherited'));

  constructor() {
    const businessId = this.businessId();

    if (businessId) {
      this.finance.businessCurrent(businessId).subscribe({
        next: c => { this.bizComp.set(c); this.bizLoading.set(false); },
        error: () => this.bizLoading.set(false),
      });
      this.sedesApi.list(businessId).subscribe({ next: b => this.branches.set(b) });
      this.serviciosApi.list(businessId).subscribe({ next: o => this.offerings.set(o) });
      this.systemListsApi.itemsEnabled('employee_position').pipe(
        map((items: CatalogItem[]) => new Map(items.map(i => [i.id, i.name]))),
      ).subscribe({ next: m => this.positionName.set(m) });
    } else {
      this.bizLoading.set(false);
    }

    // Excepción por sede: cargar la config propia de la sede elegida.
    effect(() => {
      const id = this.branchSelId();
      this.branchComp.set(null);
      if (id) this.finance.branchCurrent(id).subscribe({ next: c => this.branchComp.set(c) });
    });

    // Picker de empleado: la sede filtra el listado y define su herencia.
    effect(() => {
      const id = this.empBranchId();
      this.employees.set([]);
      this.empSelId.set(null);
      this.empBranchComp.set(null);
      if (!id) return;
      this.empleadosApi.listDetailed(id).subscribe({ next: list => this.employees.set(list) });
      this.finance.branchCurrent(id).subscribe({ next: c => this.empBranchComp.set(c) });
    });

    effect(() => {
      const id = this.empSelId();
      this.empComp.set(null);
      if (id) this.finance.employeeCurrent(id).subscribe({ next: c => this.empComp.set(c) });
    });
  }

  saveBusiness(d: CompensationDraft) {
    const businessId = this.businessId();
    if (!businessId) return;
    this.bizSaving.set(true);
    const own = this.bizComp();
    (own ? this.finance.businessSupersede(own.id, businessId, d) : this.finance.businessCreate(businessId, d))
      .subscribe({
        next: saved => { this.bizComp.set(saved); this.bizSaving.set(false); this.toast.success('Base de la empresa guardada'); },
        error: () => this.bizSaving.set(false),
      });
  }

  saveBranch(d: CompensationDraft) {
    const branchId = this.branchSelId();
    if (!branchId) return;
    this.branchSaving.set(true);
    const own = this.branchComp();
    (own ? this.finance.branchSupersede(own.id, branchId, d) : this.finance.branchCreate(branchId, d))
      .subscribe({
        next: saved => {
          this.branchComp.set(saved);
          // Si el picker de empleado apunta a la misma sede, su herencia cambia.
          if (this.empBranchId() === branchId) this.empBranchComp.set(saved);
          this.branchSaving.set(false);
          this.toast.success('Excepción de sede guardada');
        },
        error: () => this.branchSaving.set(false),
      });
  }

  saveEmployee(d: CompensationDraft) {
    const employeeId = this.empSelId();
    if (!employeeId) return;
    this.empSaving.set(true);
    const own = this.empComp();
    (own ? this.finance.employeeSupersede(own.id, employeeId, d) : this.finance.employeeCreate(employeeId, d))
      .subscribe({
        next: saved => { this.empComp.set(saved); this.empSaving.set(false); this.toast.success('Compensación individual guardada'); },
        error: () => this.empSaving.set(false),
      });
  }
}
