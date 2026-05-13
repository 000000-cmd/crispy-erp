import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Grupo de checkboxes (multi-seleccion o single via field.multiple=false).
 * Usa el CheckboxComponent compartido para alinear con el design system.
 */
@Component({
  selector: 'df-checkbox-group-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckboxComponent, TPipe],
  template: `
    <div class="flex flex-wrap gap-x-5 gap-y-2 py-1">
      @for (o of options(); track o.value) {
        <app-checkbox
          [checked]="isChecked(o)"
          [disabled]="o.disabled || false"
          [label]="o.label"
          (checkedChange)="toggle(o, $event)"
        />
      }
    </div>
    @if (showError()) {
      <p class="text-[11px] text-rose-600 mt-1">{{ errorMsg().key | t : errorMsg().params }}</p>
    } @else if (hint()) {
      <p class="text-[11px] text-text-muted mt-1">{{ hint() }}</p>
    }
  `,
})
export class CheckboxGroupFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  isChecked(o: Option): boolean {
    const v = this.ctrl().value;
    if (this.field().multiple === false) return v === o.value;
    return Array.isArray(v) && v.includes(o.value);
  }

  toggle(o: Option, checked: boolean) {
    if (this.field().multiple === false) {
      this.ctrl().setValue(checked ? o.value : null);
    } else {
      const cur: any[] = Array.isArray(this.ctrl().value) ? [...this.ctrl().value] : [];
      const i = cur.indexOf(o.value);
      if (checked && i < 0) cur.push(o.value);
      if (!checked && i >= 0) cur.splice(i, 1);
      this.ctrl().setValue(cur);
    }
    this.ctrl().markAsDirty();
    this.ctrl().markAsTouched();
  }

  /** Reactividad sobre touched/dirty/errors. */
  private readonly _tick = controlTick(this.control);

  readonly showError = computed(() => {
    this._tick();
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });
  readonly errorMsg = computed(() => {
    this._tick();
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
