import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

@Component({
  selector: 'df-checkbox-group-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  template: `
    <div class="flex flex-wrap gap-x-5 gap-y-2 py-1">
      @for (o of options(); track o.value) {
        <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            [checked]="isChecked(o)"
            (change)="toggle(o, $event)"
            [disabled]="o.disabled || false"
            class="accent-primary-500"
          />
          <span>{{ o.label }}</span>
        </label>
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
  /** Hint resuelto por el dynamic-form. */
  readonly hint = input<string>('');
  readonly ctrl = computed(() => this.control() as any);

  isChecked(o: Option): boolean {
    const v = this.ctrl().value;
    if (this.field().multiple === false) return v === o.value;
    return Array.isArray(v) && v.includes(o.value);
  }

  toggle(o: Option, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
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

  readonly showError = computed(() => {
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });
  readonly errorMsg = computed(() => {
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
