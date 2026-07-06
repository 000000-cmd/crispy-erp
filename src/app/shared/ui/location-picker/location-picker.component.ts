import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { AutocompleteOption } from '../autocomplete/autocomplete.types';
import { LocationsApi } from '../../../core/location/locations.api';
import { LocationHit, NeighborhoodType } from '../../../core/location/locations.model';
import { LocationLevel, LocationSelection } from './location-picker.types';

/**
 * Picker de localización. Dos modos:
 *
 *  - `search` (default): el usuario busca el MUNICIPIO directamente y el país y
 *    el departamento se derivan del resultado (evita llenar país/departamento a
 *    mano — el hit de ES ya trae toda la cadena). Opcionalmente pide barrio.
 *  - `hierarchy`: cascada clásica País > Departamento > Municipio > Barrio, para
 *    navegación jerárquica (CRUD/filtros de división política).
 *
 * Siempre apilado en columna (una sola por fila) para que el texto de nombres
 * largos se lea completo. Emite `(change)` con codes + hits crudos en `meta`.
 */
export type { LocationSelection, LocationLevel } from './location-picker.types';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteComponent],
  templateUrl: './location-picker.component.html',
})
export class LocationPickerComponent {
  private readonly api = inject(LocationsApi);

  /** `search` (municipio primero) | `hierarchy` (cascada de 4 niveles). */
  readonly mode = input<'search' | 'hierarchy'>('search');
  /** Niveles a mostrar (aplica al modo hierarchy y a si se pide barrio en search). Default: los 4. */
  readonly levels = input<LocationLevel[]>(['country', 'department', 'municipality', 'neighborhood']);
  /** Filtra barrios por tipo (BARRIO|VEREDA|CORREGIMIENTO|OTRO). */
  readonly neighborhoodType = input<NeighborhoodType | null>(null);
  /** Labels por nivel (opcional). */
  readonly labels = input<Partial<Record<LocationLevel, string>>>({
    country: 'País',
    department: 'Departamento',
    municipality: 'Municipio',
    neighborhood: 'Barrio / Vereda',
  });

  @Output() readonly change = new EventEmitter<LocationSelection>();

  // ---- Estado interno (codes seleccionados) ----
  readonly country = signal<string | null>(null);
  readonly department = signal<string | null>(null);
  readonly municipality = signal<string | null>(null);
  readonly neighborhood = signal<string | null>(null);

  private selectedCountry: AutocompleteOption | null = null;
  private selectedDepartment: AutocompleteOption | null = null;
  private selectedMunicipality: AutocompleteOption | null = null;
  private selectedNeighborhood: AutocompleteOption | null = null;

  /** Contexto derivado del municipio elegido (para mostrarlo, modo search). */
  readonly derivedContext = signal<string | null>(null);

  readonly askNeighborhood = computed(() => this.levels().includes('neighborhood'));

  readonly show = computed<Record<LocationLevel, boolean>>(() => {
    const l = this.levels();
    return {
      country: l.includes('country'),
      department: l.includes('department'),
      municipality: l.includes('municipality'),
      neighborhood: l.includes('neighborhood'),
    };
  });

  // searchFns reactivas a los padres seleccionados.
  readonly countriesFn      = computed(() => this.api.searchFn.countries());
  readonly departmentsFn    = computed(() => this.api.searchFn.departments(this.country() ?? undefined));
  readonly municipalitiesFn = computed(() => this.api.searchFn.municipalities(this.country() ?? undefined, this.department() ?? undefined));
  readonly neighborhoodsFn  = computed(() => this.api.searchFn.neighborhoods(
    this.country() ?? undefined,
    this.department() ?? undefined,
    this.municipality() ?? undefined,
    this.neighborhoodType() ?? undefined,
  ));

  // ---- Modo search: municipio directo, deriva país + departamento ----
  onMunicipalitySearch(opt: AutocompleteOption | null) {
    this.selectedMunicipality = opt;
    const hit = (opt?.meta?.['hit'] as LocationHit | undefined) ?? undefined;
    this.municipality.set((hit?.municipalityCode ?? (opt?.value as string)) ?? null);
    // Derivar cadena padre desde el hit (ES ya la trae).
    this.selectedCountry = null;
    this.selectedDepartment = null;
    this.country.set(hit?.countryCode ?? null);
    this.department.set(hit?.departmentCode ?? null);
    this.derivedContext.set(hit
      ? [hit.departmentName, hit.countryName].filter(Boolean).join(' · ') || null
      : null);
    // Cambiar de municipio invalida el barrio.
    this.selectedNeighborhood = null;
    this.neighborhood.set(null);
    this.emit();
  }

  // ---- Modo hierarchy: cascada ----
  onCountry(opt: AutocompleteOption | null) {
    this.selectedCountry = opt;
    this.country.set((opt?.value as string) ?? null);
    this.selectedDepartment = this.selectedMunicipality = this.selectedNeighborhood = null;
    this.department.set(null); this.municipality.set(null); this.neighborhood.set(null);
    this.emit();
  }

  onDepartment(opt: AutocompleteOption | null) {
    this.selectedDepartment = opt;
    this.department.set((opt?.value as string) ?? null);
    this.selectedMunicipality = this.selectedNeighborhood = null;
    this.municipality.set(null); this.neighborhood.set(null);
    this.emit();
  }

  onMunicipality(opt: AutocompleteOption | null) {
    this.selectedMunicipality = opt;
    this.municipality.set((opt?.value as string) ?? null);
    this.selectedNeighborhood = null;
    this.neighborhood.set(null);
    this.emit();
  }

  onNeighborhood(opt: AutocompleteOption | null) {
    this.selectedNeighborhood = opt;
    this.neighborhood.set((opt?.value as string) ?? null);
    this.emit();
  }

  private emit() {
    this.change.emit({
      country: this.country() ?? undefined,
      department: this.department() ?? undefined,
      municipality: this.municipality() ?? undefined,
      neighborhood: this.neighborhood() ?? undefined,
      meta: {
        country: this.selectedCountry,
        department: this.selectedDepartment,
        municipality: this.selectedMunicipality,
        neighborhood: this.selectedNeighborhood,
      },
    });
  }
}
