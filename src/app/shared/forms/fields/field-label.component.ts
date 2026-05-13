import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Check, X, AlertTriangle, LucideAngularModule } from 'lucide-angular';
import { TooltipComponent } from '../../ui/tooltip/tooltip.component';
import { resolveIcon } from '../../../layouts/shell/icon-resolver';
import { controlTick } from '../core/control-tick';

/**
 * Label reutilizable para los campos del dynamic-form.
 *
 * Composicion (de izquierda a derecha):
 *   [* requerido]  [icono opcional]  [texto]  [tooltip ?]  [badge estado]
 *
 * Badge de estado (lado derecho), aparece cuando el control esta touched o
 * dirty:
 *   - check verde si valido y con valor
 *   - X rojo si requerido y vacio
 *   - warning ambar si tiene valor pero es invalido (formato/regla)
 *
 * Las tres iconos viven apilados con position:absolute y se cruzan por
 * opacidad para que la transicion sea suave al cambiar de estado.
 */
@Component({
  selector: 'df-field-label',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipComponent],
  template: `
    <label
      [for]="forId()"
      class="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5"
    >
      @if (required()) {
        <span class="text-rose-500" aria-hidden="true">*</span>
      }

      @if (lucideIcon()) {
        <lucide-angular [img]="lucideIcon()" class="w-3.5 h-3.5 text-primary-500"></lucide-angular>
      }

      <span>{{ label() }}</span>

      @if (tooltip()) {
        <app-tooltip [text]="tooltip()!" [variant]="tooltipVariant()"></app-tooltip>
      }

      <span
        class="ml-auto relative inline-block w-3.5 h-3.5 transition-opacity duration-200"
        [class.opacity-0]="!showStateBadge()"
        [class.opacity-100]="showStateBadge()"
        [attr.aria-label]="ariaState()"
      >
        <lucide-angular
          [img]="ValidIcon"
          class="w-3.5 h-3.5 text-emerald-500 absolute inset-0 transition-opacity duration-200"
          [class.opacity-100]="state() === 'valid'"
          [class.opacity-0]="state() !== 'valid'"
        ></lucide-angular>
        <lucide-angular
          [img]="MissingIcon"
          class="w-3.5 h-3.5 text-rose-500 absolute inset-0 transition-opacity duration-200"
          [class.opacity-100]="state() === 'missing'"
          [class.opacity-0]="state() !== 'missing'"
        ></lucide-angular>
        <lucide-angular
          [img]="InvalidIcon"
          class="w-3.5 h-3.5 text-amber-500 absolute inset-0 transition-opacity duration-200"
          [class.opacity-100]="state() === 'invalid'"
          [class.opacity-0]="state() !== 'invalid'"
        ></lucide-angular>
      </span>
    </label>
  `,
})
export class FieldLabelComponent {
  readonly forId = input<string>('');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly tooltip = input<string | undefined>(undefined);
  readonly tooltipVariant = input<'info' | 'warning' | 'error'>('info');
  readonly control = input<AbstractControl | null>(null);

  readonly ValidIcon = Check;
  readonly MissingIcon = X;
  readonly InvalidIcon = AlertTriangle;

  /** Reactividad sobre touched/dirty/errors. */
  private readonly _tick = controlTick(this.control);

  readonly lucideIcon = computed(() => {
    const name = this.icon();
    return name ? resolveIcon(name) : null;
  });

  readonly showStateBadge = computed(() => {
    this._tick();
    const c = this.control();
    return !!c && (c.touched || c.dirty);
  });

  /** valid | missing | invalid | none */
  readonly state = computed<'valid' | 'missing' | 'invalid' | 'none'>(() => {
    this._tick();
    const c = this.control();
    if (!c) return 'none';
    const empty = isEmpty(c.value);
    if (c.errors) {
      if (empty) return 'missing';
      return 'invalid';
    }
    return empty ? 'none' : 'valid';
  });

  readonly ariaState = computed(() => ({
    valid: 'Campo válido',
    missing: 'Campo requerido sin completar',
    invalid: 'Valor inválido',
    none: '',
  }[this.state()]));
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}
