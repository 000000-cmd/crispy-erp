import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { AutocompleteOption } from '../autocomplete/autocomplete.types';
import { LocationsApi, NeighborhoodType } from '../../../core/location/locations.api';

/**
 * Picker jerarquico de localizacion (Pais > Departamento > Municipio > Barrio/Vereda).
 *
 * Reutiliza `app-autocomplete` para cada nivel y conecta cada uno con el
 * `LocationsApi` correspondiente. Cada vez que el user cambia un nivel,
 * limpia los hijos automaticamente.
 *
 * Casos de uso:
 *  - Filtros (cualquier subconjunto de niveles activos).
 *  - Formularios: usa los inputs `levels` para limitar los niveles visibles
 *    (por ej. solo "country" + "department" si esa es la granularidad).
 *
 * Emite `(change)` con la seleccion actual en codes y los hits crudos en `meta`.
 */
export interface LocationSelection {
  country?: string;
  department?: string;
  municipality?: string;
  neighborhood?: string;
  meta?: {
    country?: AutocompleteOption | null;
    department?: AutocompleteOption | null;
    municipality?: AutocompleteOption | null;
    neighborhood?: AutocompleteOption | null;
  };
}

export type LocationLevel = 'country' | 'department' | 'municipality' | 'neighborhood';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteComponent],
  templateUrl: './location-picker.component.html',
})
export class LocationPickerComponent {
  private readonly api = inject(LocationsApi);

  /** Niveles a mostrar. Default: los 4. */
  readonly levels = input<LocationLevel[]>(['country', 'department', 'municipality', 'neighborhood']);
  /** Filtra barrios por tipo (BARRIO|VEREDA|CORREGIMIENTO|OTRO). */
  readonly neighborhoodType = input<NeighborhoodType | null>(null);
  /** Layout en filas (responsive grid) vs apilado vertical. */
  readonly inline = input<boolean>(true);
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

  onCountry(opt: AutocompleteOption | null) {
    this.selectedCountry = opt;
    this.country.set((opt?.value as string) ?? null);
    // Reset cascada
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
