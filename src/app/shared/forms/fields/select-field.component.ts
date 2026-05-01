import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Select y multiselect del dynamic-form.
 *
 * Implementa un dropdown propio (no usa `<select>` nativo) para poder animar
 * la apertura/cierre y el chevron, replicando la fluidez de los selects de
 * rifasya pero con los tokens del design system de crispy. Trabaja contra
 * el `AbstractControl` recibido por input — escribe con `setValue`/`patchValue`
 * y propaga `markAsTouched` al cerrar el panel.
 *
 * En `multiselect` el valor del control es un array de valores; cada click en
 * una opcion la agrega o la quita.
 */
@Component({
  selector: 'df-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TPipe],
  template: `
    <div class="relative">
      <button
        type="button"
        [disabled]="control().disabled"
        (click)="toggle()"
        (blur)="onBlur()"
        [class]="triggerClass()"
      >
        <span class="truncate text-left flex-1" [class.text-text-soft]="!hasSelection()">
          {{ displayLabel() }}
        </span>
        <lucide-angular
          [img]="ChevronIcon"
          class="w-4 h-4 opacity-70 transition-transform duration-200"
          [class.rotate-180]="open()"
        ></lucide-angular>
      </button>

      <div
        role="listbox"
        class="absolute z-30 mt-1 w-full rounded-md border bg-surface shadow-lg
               max-h-60 overflow-y-auto origin-top
               transition-all duration-150 ease-out border-border"
        [class.opacity-100]="open()"
        [class.scale-100]="open()"
        [class.opacity-0]="!open()"
        [class.scale-95]="!open()"
        [class.pointer-events-none]="!open()"
      >
        @for (o of options(); track o.value) {
          <div
            role="option"
            [attr.aria-selected]="isSelected(o)"
            (click)="select(o)"
            class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                   hover:bg-surface-hover transition-colors"
            [class.font-semibold]="isSelected(o)"
            [class.text-primary-500]="isSelected(o)"
            [class.opacity-50]="o.disabled"
            [class.pointer-events-none]="o.disabled"
          >
            @if (multi()) {
              <span
                class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                [class.bg-primary-500]="isSelected(o)"
                [class.border-primary-500]="isSelected(o)"
                [class.border-border]="!isSelected(o)"
              >
                @if (isSelected(o)) {
                  <span class="block w-2 h-2 bg-white rounded-sm"></span>
                }
              </span>
            }
            <span class="truncate">{{ o.label }}</span>
          </div>
        }
        @if (options().length === 0) {
          <div class="px-3 py-2 text-sm text-text-muted">Sin opciones</div>
        }
      </div>
    </div>

    @if (showError()) {
      <p class="text-[11px] text-rose-600 mt-1">{{ errorMsg().key | t : errorMsg().params }}</p>
    } @else if (hint()) {
      <p class="text-[11px] text-text-muted mt-1">{{ hint() }}</p>
    }
  `,
})
export class SelectFieldComponent {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  /** Hint ya resuelto por el dynamic-form. */
  readonly hint = input<string>('');

  readonly ChevronIcon = ChevronDown;

  private readonly host = inject(ElementRef<HTMLElement>);
  readonly open = signal(false);

  readonly multi = computed(() => this.field().type === 'multiselect');

  // Cierra el dropdown al hacer click fuera del componente. Reactive forms
  // marca touched a traves de onBlur(), pero un click fuera tambien debe
  // contar como interaccion para que aparezcan los estados de validacion.
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      if (this.open()) {
        this.open.set(false);
        this.control().markAsTouched();
      }
    }
  }

  toggle() {
    if (this.control().disabled) return;
    this.open.update(v => !v);
  }

  onBlur() {
    // El blur del boton sucede antes del click en una opcion, asi que no
    // cerramos aqui — el click-outside o el select() se encargan.
    this.control().markAsTouched();
  }

  select(o: Option) {
    if (o.disabled) return;
    if (this.multi()) {
      const current: any[] = Array.isArray(this.control().value) ? [...this.control().value] : [];
      const idx = current.indexOf(o.value);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(o.value);
      this.control().setValue(current);
      // En multiselect mantenemos el panel abierto para encadenar selecciones.
    } else {
      this.control().setValue(o.value);
      this.open.set(false);
    }
    this.control().markAsDirty();
  }

  isSelected(o: Option): boolean {
    const v = this.control().value;
    if (this.multi()) return Array.isArray(v) && v.includes(o.value);
    return v === o.value;
  }

  hasSelection(): boolean {
    const v = this.control().value;
    if (this.multi()) return Array.isArray(v) && v.length > 0;
    return v !== null && v !== undefined && v !== '';
  }

  displayLabel(): string {
    const v = this.control().value;
    if (this.multi()) {
      if (!Array.isArray(v) || v.length === 0) return this.field().placeholder || 'Selecciona…';
      const labels = this.options()
        .filter(o => v.includes(o.value))
        .map(o => o.label);
      return labels.join(', ');
    }
    const found = this.options().find(o => o.value === v);
    return found?.label ?? (this.field().placeholder || 'Selecciona…');
  }

  readonly triggerClass = computed(() => {
    const base =
      'w-full flex items-center gap-2 rounded-md border bg-surface text-text px-3 py-2 text-sm ' +
      'transition-all duration-200 outline-none cursor-pointer ' +
      'focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed';
    return `${base} ${this.borderClass()}`;
  });

  readonly borderClass = computed(() => {
    if (this.showError()) return 'border-rose-500';
    if (this.showValid()) return 'border-emerald-500';
    return 'border-border focus:border-primary-500';
  });

  readonly showError = computed(() => {
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly showValid = computed(() => {
    const c = this.control();
    return !c.errors && c.valid && (c.touched || c.dirty) && this.hasSelection();
  });

  readonly errorMsg = computed(() => {
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });
}
