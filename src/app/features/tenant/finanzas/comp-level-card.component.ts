import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { LucideAngularModule, Check, Sparkles, CircleDashed, Lock, Banknote, Scale, Percent, PieChart } from 'lucide-angular';
import { COMP_TYPES, Compensation, CompensationDraft, CompensationType, compTypeMeta } from './finance.model';
import { formatCOP, maskThousands, parseCOP } from '../../../shared/util/money';
import { PercentInputComponent } from '../../../shared/ui/percent-input/percent-input.component';
import { TooltipComponent } from '../../../shared/ui/tooltip/tooltip.component';

/**
 * Editor de UN nivel de compensación (Empresa/Sede/Empleado).
 *
 * Nunca se ve vacío: sin configuración propia PRECARGA la heredada (badge
 * "Heredada de …"). Editar y guardar crea el registro EN ESTE nivel; desde
 * entonces muestra lo propio ("Propia"). El porcentaje usa el control custom
 * del design system (no el range nativo) y cada pieza lleva su ayuda en
 * tooltip para que el flujo sea instintivo.
 */
@Component({
  selector: 'app-comp-level-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PercentInputComponent, TooltipComponent],
  template: `
    <div class="relative h-full rounded-2xl border bg-surface p-5 transition-all"
         [class.border-border]="badge() !== 'inherited'"
         [class.border-dashed]="badge() === 'inherited'"
         [class.border-amber-400]="badge() === 'inherited'">

      <!-- header -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 min-w-0">
          <h2 class="text-sm font-semibold text-text truncate">{{ levelLabel() }}</h2>
          @if (optional()) {
            <span class="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">Opcional</span>
          }
          @if (help()) { <app-tooltip [text]="help()" /> }
        </div>

        @if (!locked()) {
          @switch (badge()) {
            @case ('own') {
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-1 text-xs font-medium">
                <lucide-icon [img]="checkIcon" [size]="12" /> Propia
              </span>
            }
            @case ('inherited') {
              <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-1 text-xs font-medium">
                <lucide-icon [img]="sparklesIcon" [size]="12" /> Heredada de {{ inheritedFrom() }}
              </span>
            }
            @default {
              <span class="inline-flex items-center gap-1 rounded-full bg-surface-muted text-text-muted px-2.5 py-1 text-xs font-medium">
                <lucide-icon [img]="dashedIcon" [size]="12" /> Sin configurar
              </span>
            }
          }
        }
      </div>

      @if (locked()) {
        <div class="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted/50 p-4 text-sm text-text-muted">
          <lucide-icon [img]="lockIcon" [size]="16" class="shrink-0 text-text-soft" />
          {{ lockedHint() }}
        </div>
      } @else {
        <!-- modo de pago -->
        <div class="mt-4">
          <div class="flex items-center gap-1.5 mb-2">
            <p class="text-xs font-medium text-text-muted">¿Cómo se paga?</p>
            <app-tooltip text="Elige el modelo: salario fijo, o un porcentaje de lo que produce el colaborador." />
          </div>
          <div class="grid grid-cols-2 gap-3">
            @for (t of types; track t.code) {
              <button type="button" (click)="pickType(t.code)"
                      class="relative rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 flex flex-col gap-3"
                      [class.border-primary]="draftType() === t.code"
                      [class.bg-primary-fixed/20]="draftType() === t.code"
                      [class.border-surface-variant]="draftType() !== t.code"
                      [class.bg-surface-container-lowest]="draftType() !== t.code">
                @if (draftType() === t.code && badge() === 'own') {
                  <span class="absolute top-3 right-3 bg-primary text-on-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Sobrescrito</span>
                }
                <span class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      [class.bg-primary-container]="draftType() === t.code" [class.text-on-primary-container]="draftType() === t.code"
                      [class.bg-surface-container-highest]="draftType() !== t.code" [class.text-on-surface-variant]="draftType() !== t.code">
                  <lucide-icon [img]="payIcon(t.code)" [size]="20" />
                </span>
                <div>
                  <p class="font-label-md text-label-md font-bold text-on-surface">{{ t.label }}</p>
                  <p class="font-body-md text-xs text-on-surface-variant mt-0.5 leading-tight">{{ t.hint }}</p>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- valor -->
        <div class="mt-4 space-y-3">
          @if (hasSalaryBase()) {
            <div>
              <div class="flex items-center gap-1.5 mb-2">
                <p class="text-xs font-medium text-text-muted">Salario base mensual</p>
                <app-tooltip text="Salario fijo que se paga además del porcentaje. En pesos colombianos." />
              </div>
              <div class="relative max-w-56">
                <span class="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-sm text-text-muted">$</span>
                <input type="text" inputmode="numeric" placeholder="0"
                       [value]="salaryBaseMasked()"
                       (input)="onSalaryBaseInput($any($event.target))"
                       class="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm text-text tabular-nums outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            </div>
          }
          @if (isPercent()) {
            <app-percent-input [value]="draftValue()" (valueChange)="setValue($event)" />
          } @else {
            <div>
              <div class="flex items-center gap-1.5 mb-2">
                <p class="text-xs font-medium text-text-muted">Salario mensual</p>
                <app-tooltip text="Monto fijo en pesos colombianos. Puedes actualizarlo cuando quieras: se guarda el histórico." />
              </div>
              <div class="relative max-w-56">
                <span class="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-sm text-text-muted">$</span>
                <input type="text" inputmode="numeric" placeholder="0"
                       [value]="moneyMasked()"
                       (input)="onMoneyInput($any($event.target))"
                       class="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm text-text tabular-nums outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            </div>
          }
        </div>

        <!-- resumen + guardar -->
        <div class="mt-4 flex items-center justify-between gap-3 flex-wrap border-t border-border pt-3">
          <p class="text-sm text-text-muted italic min-w-0">{{ summary() }}</p>
          <button type="button" (click)="doSave()"
                  [disabled]="!dirty() || saving() || draftValue() === null || (hasSalaryBase() && draftSalaryBase() === null)"
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed">
            {{ saving() ? 'Guardando…' : saveLabel() }}
          </button>
        </div>
      }
    </div>
  `,
})
export class CompLevelCardComponent {
  readonly levelLabel = input.required<string>();
  /** Ayuda del nivel (tooltip junto al título). */
  readonly help = input('');
  /** Muestra el chip "Opcional" (sede/empleado). */
  readonly optional = input(false);
  /** Registro vigente PROPIO del nivel (null si no tiene). */
  readonly own = input<Compensation | null>(null);
  /** Config heredada a precargar cuando no hay propia. */
  readonly inherited = input<Compensation | null>(null);
  readonly inheritedFrom = input('Empresa');
  /** Bloqueado (falta un prerequisito: selección o base de empresa). */
  readonly locked = input(false);
  readonly lockedHint = input('Completa el paso anterior para configurar este nivel.');
  readonly saving = input(false);

  readonly save = output<CompensationDraft>();
  /** Borrador EN VIVO (para que la simulación se mueva mientras el dueño edita). */
  readonly draftChange = output<CompensationDraft>();
  /** Si el borrador difiere de lo guardado/heredado (para la etiqueta simulado/guardado). */
  readonly dirtyChange = output<boolean>();

  protected readonly types = COMP_TYPES;
  protected readonly checkIcon = Check;
  protected readonly sparklesIcon = Sparkles;
  protected readonly dashedIcon = CircleDashed;
  protected readonly lockIcon = Lock;

  private readonly payIcons: Record<CompensationType, any> = {
    SALARY_ONLY: Banknote,
    SALARY_PLUS_COMMISSION: Scale,
    SALARY_PLUS_SERVICE_PERCENT: Percent,
    SERVICE_PERCENT_ONLY: PieChart,
  };
  protected payIcon(code: CompensationType): any { return this.payIcons[code]; }

  readonly draftType = signal<CompensationType>('SERVICE_PERCENT_ONLY');
  readonly draftValue = signal<number | null>(null);
  readonly draftSalaryBase = signal<number | null>(null);
  readonly dirty = signal(false);

  /** Reinicia el borrador cada vez que cambia la base (propia o heredada). */
  private readonly seed = effect(() => {
    const base = this.own() ?? this.inherited();
    this.draftType.set(base?.compensationType ?? 'SERVICE_PERCENT_ONLY');
    this.draftValue.set(base?.compensationValue ?? null);
    this.draftSalaryBase.set(base?.salaryBase ?? null);
    this.dirty.set(false);
  });

  /** Empuja el borrador en vivo al padre para que la simulación se recalcule al instante. */
  private readonly emitDraft = effect(() => {
    const type = this.draftType();
    const value = this.draftValue();
    const salaryBase = compTypeMeta(type).hasSalaryBase ? this.draftSalaryBase() : null;
    this.draftChange.emit({ compensationType: type, compensationValue: value, salaryBase });
  });
  private readonly emitDirty = effect(() => this.dirtyChange.emit(this.dirty()));

  readonly badge = computed(() => this.own() ? 'own' : this.inherited() ? 'inherited' : 'none');
  readonly isPercent = computed(() => compTypeMeta(this.draftType()).kind === 'percent');
  readonly hasSalaryBase = computed(() => compTypeMeta(this.draftType()).hasSalaryBase);
  readonly moneyMasked = computed(() => maskThousands(this.draftValue()));
  readonly salaryBaseMasked = computed(() => maskThousands(this.draftSalaryBase()));

  readonly summary = computed(() => {
    const v = this.draftValue();
    if (v === null) return 'Define el valor para completar la regla.';
    switch (this.draftType()) {
      case 'SALARY_ONLY': return `Salario fijo de ${formatCOP(v)} mensuales.`;
      case 'SALARY_PLUS_COMMISSION': return `Salario base de ${formatCOP(this.draftSalaryBase() ?? 0)} más ${v}% de comisión por ventas.`;
      case 'SALARY_PLUS_SERVICE_PERCENT': return `Salario base de ${formatCOP(this.draftSalaryBase() ?? 0)} más el ${v}% de cada servicio.`;
      default: return `Recibe el ${v}% de cada servicio.`;
    }
  });

  readonly saveLabel = computed(() => this.own() ? 'Actualizar' : 'Guardar aquí');

  pickType(code: CompensationType) {
    if (this.draftType() === code) return;
    this.draftType.set(code);
    const nowPercent = compTypeMeta(code).kind === 'percent';
    const v = this.draftValue();
    if (v !== null && nowPercent && v > 100) this.draftValue.set(null);
    this.dirty.set(true);
  }

  setValue(v: number | null) {
    this.draftValue.set(v === null ? null : Math.max(0, this.isPercent() ? Math.min(100, v) : v));
    this.dirty.set(true);
  }

  onMoneyInput(el: HTMLInputElement) {
    const v = parseCOP(el.value);
    el.value = maskThousands(v);
    this.setValue(v);
  }

  onSalaryBaseInput(el: HTMLInputElement) {
    const v = parseCOP(el.value);
    el.value = maskThousands(v);
    this.draftSalaryBase.set(v);
    this.dirty.set(true);
  }

  doSave() {
    const v = this.draftValue();
    if (v === null) return;
    if (this.hasSalaryBase() && this.draftSalaryBase() === null) return;
    this.save.emit({
      compensationType: this.draftType(),
      compensationValue: v,
      salaryBase: this.hasSalaryBase() ? this.draftSalaryBase() : null,
    });
  }
}
