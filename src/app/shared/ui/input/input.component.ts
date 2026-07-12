import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { FieldState, FieldStatusComponent } from '../field-status/field-status.component';

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
  imports: [CommonModule, LucideAngularModule, FieldStatusComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true },
  ],
  templateUrl: './input.component.html',
})
export class InputComponent implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date'>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  /** Estado de validación (idle/valid/error/warn) → borde + ícono. */
  readonly state = input<FieldState>('idle');
  readonly autocomplete = input<string | null>(null);
  readonly suffix = input<string>('');

  /** `invalid` (legado) mapea a `error` si no se pasó un `state` explícito. */
  readonly effectiveState = computed<FieldState>(() =>
    this.state() !== 'idle' ? this.state() : this.invalid() ? 'error' : 'idle',
  );

  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;
  /** Solo aplica a type=password: alterna ver/ocultar. */
  readonly revealed = signal(false);
  readonly isPassword = computed(() => this.type() === 'password');
  /** El type efectivo del <input> (password → text mientras está revelado). */
  readonly effectiveType = computed(() => this.isPassword() && this.revealed() ? 'text' : this.type());
  protected toggleReveal() { this.revealed.update(v => !v); }

  readonly boxClasses = computed(() => {
    const map: Record<FieldState, string> = {
      idle:  'border-border focus-within:border-primary-500 focus-within:ring-primary-500/30',
      valid: 'border-emerald-500 focus-within:ring-emerald-500/30',
      error: 'border-rose-500 focus-within:ring-rose-400/30',
      warn:  'border-amber-500 focus-within:ring-amber-400/30',
    };
    return map[this.effectiveState()];
  });

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
