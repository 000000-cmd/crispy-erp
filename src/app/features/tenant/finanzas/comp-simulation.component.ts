import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Info, Calculator, Plus, Check, TrendingUp } from 'lucide-angular';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { formatCOP } from '../../../shared/util/money';
import { Compensation, CompensationDraft, compTypeMeta } from './finance.model';
import { Offering } from '../servicios/servicios.model';

/** ≈ servicios de un mismo tipo que se hacen en un mes (referencia para proyectar). */
const MONTHLY_UNITS = 30;

/**
 * Simulación mensual DINÁMICA de un nivel de compensación. Para tipos de % de
 * servicio, el mini-modal lista cada servicio con su comisión por UNIDAD
 * (precio × %, ×1); el dueño "trae al mes" los servicios que quiera y el panel
 * grande proyecta la comisión mensual (precio × % × 30). A nivel empleado los
 * servicios se filtran a su especialidad. Es una estimación de vista previa: no
 * persiste ni llama al back.
 */
@Component({
  selector: 'app-comp-simulation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalComponent],
  templateUrl: './comp-simulation.component.html',
})
export class CompSimulationComponent {
  readonly comp = input<Compensation | CompensationDraft | null>(null);
  readonly offerings = input<Offering[]>([]);
  /** Si se define, filtra los servicios a esa especialidad (nivel empleado). */
  readonly specialtyId = input<string | null>(null);
  readonly title = input('Simulación mensual');
  /** Chip opcional (p. ej. iniciales del empleado). */
  readonly badge = input('');
  /** Hay cambios sin guardar en la config → la etiqueta muestra "valor simulado". */
  readonly dirty = input(false);
  /**
   * De dónde sale lo que se simula. `inherited` avisa que este nivel NO tiene
   * regla propia y se está proyectando la del nivel superior — si no, el panel
   * decía "valor guardado" sobre una regla que en realidad no le pertenece.
   */
  readonly source = input<'draft' | 'own' | 'inherited'>('own');
  /** Nivel del que se hereda, para nombrarlo en la etiqueta. */
  readonly inheritedFrom = input('Empresa');

  readonly isInherited = computed(() => !this.dirty() && this.source() === 'inherited');
  readonly stateLabel = computed(() => this.dirty()
    ? 'Valor simulado'
    : (this.isInherited() ? `Heredado de ${this.inheritedFrom().toLowerCase()}` : 'Valor guardado'));

  protected readonly infoIcon = Info;
  protected readonly calcIcon = Calculator;
  protected readonly plusIcon = Plus;
  protected readonly checkIcon = Check;
  protected readonly trendIcon = TrendingUp;
  protected readonly fmt = formatCOP;
  protected readonly monthlyUnits = MONTHLY_UNITS;

  readonly showBreakdown = signal(false);
  /** Ids de servicios "traídos al mes" (proyección ×30). */
  readonly selected = signal<Set<string>>(new Set<string>());

  private readonly type = computed(() => this.comp()?.compensationType ?? null);
  readonly isServicePercent = computed(() =>
    this.type() === 'SALARY_PLUS_SERVICE_PERCENT' || this.type() === 'SERVICE_PERCENT_ONLY');
  readonly percent = computed(() => {
    const t = this.type();
    if (!t) return 0;
    return compTypeMeta(t).kind === 'percent' ? (this.comp()?.compensationValue ?? 0) : 0;
  });
  readonly salaryBase = computed(() => {
    const c = this.comp(); if (!c) return 0;
    if (c.compensationType === 'SALARY_ONLY') return c.compensationValue ?? 0;
    return c.salaryBase ?? 0;
  });

  /** Servicios que entran al cálculo (filtrados por especialidad si aplica). */
  readonly services = computed(() => {
    const sid = this.specialtyId();
    const list = this.offerings().filter(o => o.isActive !== false);
    return sid ? list.filter(o => o.specialtyId === sid) : list;
  });

  /** Filas del mini-modal: comisión por unidad (×1) y proyección mensual (×30). */
  readonly rows = computed(() => {
    const p = this.percent() / 100;
    const sel = this.selected();
    return this.services().map(s => ({
      id: s.id,
      name: s.name,
      price: s.price ?? 0,
      once: Math.round((s.price ?? 0) * p),
      monthly: Math.round((s.price ?? 0) * p * MONTHLY_UNITS),
      added: sel.has(s.id),
    }));
  });

  readonly addedCount = computed(() => this.rows().filter(r => r.added).length);
  /** Est. servicios (mensual) = suma de los servicios traídos al mes (×30). */
  readonly estServices = computed(() => this.rows().filter(r => r.added).reduce((a, r) => a + r.monthly, 0));
  readonly total = computed(() => this.salaryBase() + (this.isServicePercent() ? this.estServices() : 0));

  constructor() {
    // Siempre deja UN servicio por defecto (referencia inicial). Re-elige el
    // primero cuando cambia la lista (p. ej. al cambiar de empleado/especialidad).
    effect(() => {
      const svc = this.services();
      untracked(() => {
        if (svc.length && !svc.some(s => this.selected().has(s.id))) {
          this.selected.set(new Set([svc[0].id]));
        }
      });
    });
  }

  toggle(id: string) {
    this.selected.update(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  /** Trae TODOS los servicios visibles al mes (atajo). */
  addAll() {
    this.selected.set(new Set(this.services().map(s => s.id)));
  }
  /** Deja solo UNO (siempre hay un servicio por defecto). */
  clearAll() { const svc = this.services(); this.selected.set(new Set(svc.length ? [svc[0].id] : [])); }
}
