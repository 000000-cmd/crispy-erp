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
  template: `
    <label class="inline-flex items-center gap-2 select-none"
           [class.cursor-pointer]="!disabled()"
           [class.cursor-not-allowed]="disabled()"
           [class.opacity-50]="disabled()">
      <input
        type="checkbox"
        class="sr-only peer"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onToggle($any($event.target).checked)"
        (blur)="touched()"
      />

      <span
        class="w-4 h-4 inline-flex items-center justify-center rounded
               border-2 transition-all duration-200
               peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface"
        [class.bg-primary-500]="checked()"
        [class.border-primary-500]="checked()"
        [class.bg-surface]="!checked()"
        [class.border-border]="!checked() && !invalid()"
        [class.border-rose-500]="invalid() && !checked()"
        [class.hover:border-primary-500]="!disabled() && !checked() && !invalid()"
      >
        <lucide-angular
          [img]="CheckIcon"
          class="w-3 h-3 text-white transition-all duration-150"
          [class.opacity-100]="checked()"
          [class.opacity-0]="!checked()"
          [class.scale-100]="checked()"
          [class.scale-50]="!checked()"
        ></lucide-angular>
      </span>

      @if (label()) {
        <span class="text-sm text-text">{{ label() }}</span>
      }
    </label>
  `,
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
