import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Check, LucideAngularModule } from 'lucide-angular';

/**
 * Checkbox custom alineado al design system (primary color, surface, border).
 *
 * Soporta tres usos:
 *
 *   1) Standalone con [(checked)]:
 *        <app-checkbox [(checked)]="value" label="Activo" />
 *
 *   2) Como ControlValueAccessor con Reactive Forms:
 *        <app-checkbox formControlName="enabled" label="Activo" />
 *
 *   3) Sin label, con label externo (proyectado):
 *        <label class="flex items-center gap-2">
 *          <app-checkbox [(checked)]="x" />
 *          <span>...</span>
 *        </label>
 *
 * El input nativo se mantiene `sr-only` para accesibilidad (foco, ARIA,
 * tab order, screen readers). La caja visible es un span con animacion.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  templateUrl: './checkbox.component.html',
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  readonly CheckIcon = Check;

  // CVA hooks (cuando se usa con formControlName / ngModel)
  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: boolean): void { this.checked.set(!!v); }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(_: boolean): void { /* el [disabled] del template ya lo maneja */ }

  protected onToggle(v: boolean) {
    this.checked.set(v);
    this.onChange(v);
  }
  protected touched() { this.onTouched(); }
}
