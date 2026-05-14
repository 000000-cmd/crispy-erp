import { CommonModule } from '@angular/common';
import {
  AfterViewChecked, Component, ElementRef, HostListener, ViewChild,
  computed, inject, input, signal,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, Search, LucideAngularModule } from 'lucide-angular';
import { FieldConfig, Option } from '../core/types';
import { firstErrorMessage } from '../core/validators';
import { controlTick } from '../core/control-tick';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { TPipe } from '../../pipes/t.pipe';

/**
 * Select y multiselect del dynamic-form.
 *
 * Variantes (segun el FieldConfig):
 *   - select          : single. Click selecciona y cierra.
 *   - multiselect     : multi. Cada item con checkbox. Mantiene panel abierto.
 *   - + searchable:true: ambos pueden tener input de busqueda dentro del panel.
 *
 * Display del trigger en multi:
 *   - Mientras los labels separados por ", " quepan en el ancho del trigger,
 *     se muestran asi.
 *   - Al desbordar, colapsa a "N items seleccionados".
 *
 * Cierre por click-outside via HostListener('document:click').
 */
@Component({
  selector: 'df-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, CheckboxComponent, TPipe],
  templateUrl: './select-field.component.html',
})
export class SelectFieldComponent implements AfterViewChecked {
  readonly field = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();
  readonly options = input<Option[]>([]);
  readonly hint = input<string>('');

  readonly ChevronIcon = ChevronDown;
  readonly SearchIcon = Search;

  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('trigger') triggerEl?: ElementRef<HTMLElement>;
  @ViewChild('measure') measureEl?: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInputEl?: ElementRef<HTMLInputElement>;

  readonly open = signal(false);
  readonly search = signal('');
  /** True cuando los labels juntos no caben en el trigger. */
  readonly compact = signal(false);

  readonly multi = computed(() => this.field().type === 'multiselect');

  // Cierra el dropdown al hacer click fuera del componente.
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      if (this.open()) {
        this.open.set(false);
        this.search.set('');
        this.control().markAsTouched();
      }
    }
  }

  toggle() {
    if (this.control().disabled) return;
    const next = !this.open();
    this.open.set(next);
    if (next && this.field().searchable) {
      // foco al search despues de que Angular renderice el panel
      setTimeout(() => this.searchInputEl?.nativeElement.focus(), 0);
    }
    if (!next) this.search.set('');
  }

  onBlur() {
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
      this.search.set('');
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

  /** Etiquetas seleccionadas crudas (sin compactar). */
  readonly rawJoinedLabel = computed(() => {
    this._tick();
    const v = this.control().value;
    if (this.multi()) {
      if (!Array.isArray(v) || v.length === 0) return this.field().placeholder || 'Selecciona…';
      return this.options()
        .filter(o => v.includes(o.value))
        .map(o => o.label)
        .join(', ');
    }
    const found = this.options().find(o => o.value === v);
    return found?.label ?? (this.field().placeholder || 'Selecciona…');
  });

  /** Lo que finalmente se renderiza en el trigger (compactado si aplica). */
  displayLabel(): string {
    if (this.multi() && this.compact()) {
      const v = this.control().value;
      const n = Array.isArray(v) ? v.length : 0;
      if (n === 0) return this.field().placeholder || 'Selecciona…';
      if (n === 1) return '1 item seleccionado';
      return `${n} items seleccionados`;
    }
    return this.rawJoinedLabel();
  }

  readonly filteredOptions = computed<Option[]>(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.options();
    if (!q) return all;
    return all.filter(o => o.label.toLowerCase().includes(q));
  });

  readonly showHeader = computed(() =>
    !!this.field().searchable || (this.multi() && !!this.field().selectAll),
  );

  /** True si TODAS las opciones filtradas estan seleccionadas. */
  readonly allFilteredSelected = computed<boolean>(() => {
    this._tick();
    const list = this.filteredOptions();
    if (list.length === 0) return false;
    const v = this.control().value;
    const set = new Set(Array.isArray(v) ? v : []);
    return list.every(o => set.has(o.value));
  });

  toggleAll() {
    if (!this.multi()) return;
    const list = this.filteredOptions().filter(o => !o.disabled);
    if (list.length === 0) return;
    const current: any[] = Array.isArray(this.control().value) ? [...this.control().value] : [];
    const set = new Set(current);
    const allSelected = list.every(o => set.has(o.value));
    if (allSelected) {
      // Quitar solo los filtrados, no tocar los que estaban fuera del filtro.
      for (const o of list) set.delete(o.value);
    } else {
      for (const o of list) set.add(o.value);
    }
    this.control().setValue(Array.from(set));
    this.control().markAsDirty();
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

  /** Reactividad sobre touched/dirty/errors. */
  private readonly _tick = controlTick(this.control);

  readonly showError = computed(() => {
    this._tick();
    const c = this.control();
    return !!c.errors && (c.touched || c.dirty);
  });

  readonly showValid = computed(() => {
    this._tick();
    const c = this.control();
    return !c.errors && c.valid && (c.touched || c.dirty) && this.hasSelection();
  });

  readonly errorMsg = computed(() => {
    this._tick();
    const e = firstErrorMessage(this.control());
    return { key: e?.message ?? '', params: e?.params };
  });

  // ---------- Overflow detection ----------
  /**
   * Mide si el texto crudo cabe en el ancho del trigger. Si no cabe, activa
   * el modo compacto. Hacemos esto en AfterViewChecked porque ngOnInit no
   * tiene los anchos reales todavia, y el ancho cambia al redimensionar el
   * drawer/ventana o al cambiar la seleccion.
   */
  ngAfterViewChecked(): void {
    if (!this.multi()) {
      if (this.compact()) this.compact.set(false);
      return;
    }
    const measure = this.measureEl?.nativeElement;
    const trigger = this.triggerEl?.nativeElement;
    if (!measure || !trigger) return;

    // Ancho disponible: el del trigger menos padding y chevron (~32px).
    const available = trigger.clientWidth - 48;
    const required = measure.scrollWidth;
    const next = required > available;

    if (next !== this.compact()) {
      // Defer fuera del CD actual para evitar ExpressionChanged y loops.
      queueMicrotask(() => this.compact.set(next));
    }
  }
}
