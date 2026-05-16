import { CommonModule } from '@angular/common';
import {
  Component, ElementRef, EventEmitter, HostListener, OnDestroy, Output,
  ViewChild, computed, forwardRef, inject, input, signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChevronDown, Search, X, LucideAngularModule } from 'lucide-angular';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AutocompleteOption, AutocompleteSearchFn } from './autocomplete.types';

/**
 * Combobox / autocomplete reutilizable.
 *
 * Casos de uso:
 *  1. Dentro del dynamic-form, vista por el `df-autocomplete-field`.
 *  2. Standalone, en cualquier lugar (filtros, modales, etc.) con
 *     `[(ngModel)]` o `[formControl]` ya que implementa ControlValueAccessor.
 *
 * Modos de opciones:
 *  - `options` (array): filtra client-side al tipear.
 *  - `searchFn` (funcion): se llama con debounce al tipear, ideal para
 *    listas grandes (paises, municipios, etc.).
 *
 * El valor del control es el `value` de la opcion seleccionada (o null).
 */
@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteComponent), multi: true }],
  templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent implements ControlValueAccessor, OnDestroy {
  /** Opciones estaticas. Se filtran client-side por `label`. */
  readonly options = input<AutocompleteOption[]>([]);
  /** Funcion async de busqueda. Si esta definida, se ignora `options` para los resultados. */
  readonly searchFn = input<AutocompleteSearchFn | null>(null);

  readonly placeholder = input<string>('Buscar…');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly clearable = input<boolean>(true);
  /** Debounce ms para searchFn. */
  readonly debounceMs = input<number>(250);
  /** Caracteres minimos antes de invocar searchFn. 0 = busca tambien con string vacio. */
  readonly minSearchChars = input<number>(0);
  /** Mensaje cuando no hay coincidencias. */
  readonly emptyText = input<string>('Sin resultados');
  /** Mensaje cuando faltan caracteres. */
  readonly hintText = input<string>('');

  /** Emite la opcion seleccionada (o null al limpiar). Util cuando se usa fuera de forms. */
  @Output() readonly selected = new EventEmitter<AutocompleteOption | null>();

  // ---- Estado interno ----
  readonly open = signal(false);
  readonly search = signal('');
  readonly loading = signal(false);
  /** Opciones que muestra el panel cuando se usa searchFn. */
  readonly remoteOptions = signal<AutocompleteOption[]>([]);
  /** Cache de la opcion actualmente seleccionada (para mostrar label cuando closed). */
  readonly selectedOption = signal<AutocompleteOption | null>(null);

  private readonly searchTerm$ = new Subject<string>();
  private readonly subs: Subscription[] = [];
  private touchedFn: () => void = () => {};
  private changeFn: (v: any) => void = () => {};
  private currentDisabled = false;

  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

  readonly ChevronIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  constructor() {
    // Pipeline de busqueda async. Solo se activa cuando hay searchFn.
    this.subs.push(
      this.searchTerm$.pipe(
        debounceTime(0), // se sustituye por debounceMs en cada emision via switchMap
        distinctUntilChanged(),
        switchMap(term => {
          const fn = this.searchFn();
          if (!fn) return of([] as AutocompleteOption[]);
          if (term.length < this.minSearchChars()) {
            this.loading.set(false);
            return of([] as AutocompleteOption[]);
          }
          this.loading.set(true);
          return fn(term).pipe(
            catchError(() => of([] as AutocompleteOption[])),
            tap(() => this.loading.set(false)),
          );
        }),
      ).subscribe(opts => this.remoteOptions.set(opts)),
    );
  }

  ngOnDestroy(): void {
    for (const s of this.subs) s.unsubscribe();
  }

  /** Lista efectiva del panel: remoteOptions si hay searchFn, sino filtra options. */
  readonly displayed = computed<AutocompleteOption[]>(() => {
    if (this.searchFn()) return this.remoteOptions();
    const q = this.search().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(o => o.label.toLowerCase().includes(q));
  });

  readonly isDisabled = computed(() => this.disabled() || this.currentDisabled);

  /** Texto del input: lo que el user esta tipeando, o el label seleccionado si no esta abierto. */
  inputValue(): string {
    if (this.open()) return this.search();
    return this.selectedOption()?.label ?? '';
  }

  triggerClass(): string {
    const base =
      'w-full flex items-center gap-2 rounded-md border bg-surface text-text px-3 py-2 text-sm ' +
      'transition-all duration-200 outline-none ' +
      'focus-within:ring-2 focus-within:ring-primary-500/30';
    let border = 'border-border focus-within:border-primary-500';
    if (this.invalid()) border = 'border-rose-500';
    if (this.isDisabled()) return `${base} ${border} opacity-50 cursor-not-allowed`;
    return `${base} ${border}`;
  }

  // ---------- Handlers ----------

  onFocus() {
    if (this.isDisabled()) return;
    this.open.set(true);
    // Al abrir desde un valor existente, vacia el search para que el user pueda
    // re-escribir libremente. El label se conserva en selectedOption().
    this.search.set('');
    if (this.searchFn()) this.searchTerm$.next('');
  }

  onInput(value: string) {
    this.search.set(value);
    if (!this.open()) this.open.set(true);
    if (this.searchFn()) this.searchTerm$.next(value);
  }

  onBlurContainer(ev: FocusEvent) {
    // Si el foco va dentro del propio componente (ej. click en una opcion),
    // no cerramos. El click-outside del HostListener se encarga de cerrar.
    const next = ev.relatedTarget as HTMLElement | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.touchedFn();
  }

  pick(o: AutocompleteOption) {
    if (o.disabled) return;
    this.selectedOption.set(o);
    this.changeFn(o.value);
    this.selected.emit(o);
    this.open.set(false);
    this.search.set('');
    this.touchedFn();
    this.inputEl?.nativeElement.blur();
  }

  clear(ev?: Event) {
    ev?.stopPropagation();
    if (this.isDisabled()) return;
    this.selectedOption.set(null);
    this.changeFn(null);
    this.selected.emit(null);
    this.search.set('');
    this.remoteOptions.set([]);
    this.touchedFn();
  }

  toggle() {
    if (this.isDisabled()) return;
    if (this.open()) {
      this.open.set(false);
      this.search.set('');
    } else {
      this.inputEl?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (this.host.nativeElement.contains(ev.target as Node)) return;
    if (this.open()) {
      this.open.set(false);
      this.search.set('');
      this.touchedFn();
    }
  }

  // ---------- ControlValueAccessor ----------

  writeValue(value: any): void {
    if (value === null || value === undefined || value === '') {
      this.selectedOption.set(null);
      return;
    }
    // Resuelve el label desde options() si existe; caso contrario deja un placeholder
    // con el value crudo (el consumidor puede precargar selectedOption via meta).
    const found = this.options().find(o => o.value === value);
    if (found) {
      this.selectedOption.set(found);
    } else if (this.selectedOption()?.value !== value) {
      this.selectedOption.set({ value, label: String(value) });
    }
  }

  registerOnChange(fn: any): void { this.changeFn = fn; }
  registerOnTouched(fn: any): void { this.touchedFn = fn; }
  setDisabledState(isDisabled: boolean): void { this.currentDisabled = isDisabled; }
}
