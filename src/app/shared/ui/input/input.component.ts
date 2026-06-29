import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Input de texto del design system (reemplaza a los <input> nativos).
 *
 * Tres usos, como el resto de controles del sistema:
 *   1) Standalone:        <app-input [(value)]="x" />
 *   2) Inmutable/signals: <app-input [value]="m().x" (valueChange)="patch('x',$event)" />
 *   3) Reactive forms:    <app-input formControlName="x" />
 *
 * Soporta `suffix` (ej. ".tuapp.com") para inputs con sufijo fijo.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true },
  ],
  templateUrl: './input.component.html',
})
export class InputComponent implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'url' | 'number'>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly autocomplete = input<string | null>(null);
  readonly suffix = input<string>('');

  readonly boxClasses = computed(() =>
    this.invalid()
      ? 'border-rose-400 focus-within:ring-rose-400/30'
      : 'border-border focus-within:border-primary-500 focus-within:ring-primary-500/30');

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(_: boolean): void { /* el [disabled] del template lo maneja */ }

  protected onInput(v: string) {
    this.value.set(v);
    this.onChange(v);
  }
  protected touched() { this.onTouched(); }
}
