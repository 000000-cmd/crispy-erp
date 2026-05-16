import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { AutocompleteComponent } from '../../ui/autocomplete/autocomplete.component';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Adaptador del autocomplete standalone (`app-autocomplete`) al sistema de
 * dynamic-form. No implementa logica propia: solo conecta el FieldConfig con
 * los inputs del componente reutilizable.
 */
@Component({
  selector: 'df-autocomplete-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutocompleteComponent, TPipe],
  templateUrl: './autocomplete-field.component.html',
})
export class AutocompleteFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  readonly hint = input<string>('');

  // Cast tipado para usar el control con [formControl]=
  readonly fc = computed(() => this.control() as FormControl);

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
