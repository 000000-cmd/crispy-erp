import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { MICROSERVICES, ms } from '../../core/http/microservices';
import { AutocompleteOption} from '../../shared/ui/autocomplete/autocomplete.types';

const sysPath = (p: string) => ms(MICROSERVICES.SYSTEM, p);
const elPath = (p: string) => ms(MICROSERVICES.ELASTIC, p);

// =============== Tipos espejo del back (system-service CRUD) ===============

export interface Country {
  id: string;
  code: string;
  name: string;
  officialName?: string;
  isoCode3?: string;
  numericCode?: string;
  phoneCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  continent?: string;
  enabled: boolean;
  visible: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  countryId: string;
  countryCode?: string;
  countryName?: string;
  enabled: boolean;
  visible: boolean;
}

export interface Municipality {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentCode?: string;
  departmentName?: string;
  countryId?: string;
  countryCode?: string;
  countryName?: string;
  enabled: boolean;
  visible: boolean;
}

export type NeighborhoodType = 'BARRIO' | 'VEREDA' | 'CORREGIMIENTO' | 'OTRO';

export interface Neighborhood {
  id: string;
  code: string;
  name: string;
  type: NeighborhoodType;
  municipalityId: string;
  municipalityCode?: string;
  municipalityName?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  countryId?: string;
  countryCode?: string;
  countryName?: string;
  enabled: boolean;
  visible: boolean;
}

export type CountryRequest = Pick<Country, 'code' | 'name' | 'officialName' | 'isoCode3' | 'numericCode' | 'phoneCode' | 'currencyCode' | 'currencySymbol' | 'continent'>;
export type DepartmentRequest = Pick<Department, 'code' | 'name' | 'countryId'>;
export type MunicipalityRequest = Pick<Municipality, 'code' | 'name' | 'departmentId'>;
export type NeighborhoodRequest = Pick<Neighborhood, 'code' | 'name' | 'type' | 'municipalityId'>;

// =============== Tipos del search-service (LocationDocument) ===============

export interface LocationHit {
  level: 'PAIS' | 'DEPARTAMENTO' | 'MUNICIPIO' | 'BARRIO';
  countryId?: string;
  countryCode?: string;
  countryName?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  municipalityId?: string;
  municipalityCode?: string;
  municipalityName?: string;
  neighborhoodId?: string;
  neighborhoodCode?: string;
  neighborhoodName?: string;
  neighborhoodType?: NeighborhoodType;
  fullPath?: string;
  // Cualquier otro campo es ignorable.
  [k: string]: unknown;
}

export interface SearchPage<T> {
  items: T[];
  totalHits: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocationsApi {
  private readonly api = inject(ApiService);

  // -------- CRUD: countries --------
  countries(): Observable<Country[]>                    { return this.api.get(sysPath('location/countries')); }
  country(id: string): Observable<Country>              { return this.api.get(sysPath(`location/countries/${id}`)); }
  countryByCode(code: string): Observable<Country>      { return this.api.get(sysPath(`location/countries/code/${code}`)); }
  createCountry(b: CountryRequest): Observable<Country> { return this.api.post(sysPath('location/countries'), b); }
  updateCountry(id: string, b: CountryRequest)          { return this.api.put<Country>(sysPath(`location/countries/${id}`), b); }
  deleteCountry(id: string)                             { return this.api.delete<void>(sysPath(`location/countries/${id}`)); }
  toggleCountryEnabled(id: string, enabled: boolean)    { return this.api.patch<void>(sysPath(`location/countries/${id}/enabled?value=${enabled}`)); }

  // -------- CRUD: departments --------
  departments(countryId?: string): Observable<Department[]> {
    const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
    return this.api.get(sysPath(`location/departments${qs}`));
  }
  department(id: string): Observable<Department>             { return this.api.get(sysPath(`location/departments/${id}`)); }
  createDepartment(b: DepartmentRequest): Observable<Department> { return this.api.post(sysPath('location/departments'), b); }
  updateDepartment(id: string, b: DepartmentRequest)         { return this.api.put<Department>(sysPath(`location/departments/${id}`), b); }
  deleteDepartment(id: string)                               { return this.api.delete<void>(sysPath(`location/departments/${id}`)); }
  toggleDepartmentEnabled(id: string, enabled: boolean)      { return this.api.patch<void>(sysPath(`location/departments/${id}/enabled?value=${enabled}`)); }

  // -------- CRUD: municipalities --------
  municipalities(departmentId?: string): Observable<Municipality[]> {
    const qs = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
    return this.api.get(sysPath(`location/municipalities${qs}`));
  }
  municipality(id: string): Observable<Municipality>             { return this.api.get(sysPath(`location/municipalities/${id}`)); }
  createMunicipality(b: MunicipalityRequest): Observable<Municipality> { return this.api.post(sysPath('location/municipalities'), b); }
  updateMunicipality(id: string, b: MunicipalityRequest)         { return this.api.put<Municipality>(sysPath(`location/municipalities/${id}`), b); }
  deleteMunicipality(id: string)                                 { return this.api.delete<void>(sysPath(`location/municipalities/${id}`)); }
  toggleMunicipalityEnabled(id: string, enabled: boolean)        { return this.api.patch<void>(sysPath(`location/municipalities/${id}/enabled?value=${enabled}`)); }

  // -------- CRUD: neighborhoods --------
  neighborhoods(municipalityId?: string, type?: NeighborhoodType): Observable<Neighborhood[]> {
    const parts: string[] = [];
    if (municipalityId) parts.push(`municipalityId=${encodeURIComponent(municipalityId)}`);
    if (type) parts.push(`type=${encodeURIComponent(type)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return this.api.get(sysPath(`location/neighborhoods${qs}`));
  }
  neighborhood(id: string): Observable<Neighborhood>             { return this.api.get(sysPath(`location/neighborhoods/${id}`)); }
  createNeighborhood(b: NeighborhoodRequest): Observable<Neighborhood> { return this.api.post(sysPath('location/neighborhoods'), b); }
  updateNeighborhood(id: string, b: NeighborhoodRequest)         { return this.api.put<Neighborhood>(sysPath(`location/neighborhoods/${id}`), b); }
  deleteNeighborhood(id: string)                                 { return this.api.delete<void>(sysPath(`location/neighborhoods/${id}`)); }
  toggleNeighborhoodEnabled(id: string, enabled: boolean)        { return this.api.patch<void>(sysPath(`location/neighborhoods/${id}/enabled?value=${enabled}`)); }

  // ===================== SEARCH (full-text, min 3 letras) =====================
  // El back devuelve `SearchResponse<LocationDocument>` (items/total/page/size).

  searchCountries(q: string, page = 0, size = 20): Observable<SearchPage<LocationHit>> {
    return this.api.get(elPath(`locations/countries?q=${encodeURIComponent(q)}&page=${page}&size=${size}`));
  }

  searchDepartments(q: string, country?: string, page = 0, size = 20): Observable<SearchPage<LocationHit>> {
    const parts = [`q=${encodeURIComponent(q ?? '')}`, `page=${page}`, `size=${size}`];
    if (country) parts.push(`country=${encodeURIComponent(country)}`);
    return this.api.get(elPath(`locations/departments?${parts.join('&')}`));
  }

  searchMunicipalities(q: string, country?: string, department?: string, page = 0, size = 20): Observable<SearchPage<LocationHit>> {
    const parts = [`q=${encodeURIComponent(q ?? '')}`, `page=${page}`, `size=${size}`];
    if (country) parts.push(`country=${encodeURIComponent(country)}`);
    if (department) parts.push(`department=${encodeURIComponent(department)}`);
    return this.api.get(elPath(`locations/municipalities?${parts.join('&')}`));
  }

  searchNeighborhoods(q: string, country?: string, department?: string, municipality?: string, type?: string, page = 0, size = 20): Observable<SearchPage<LocationHit>> {
    const parts = [`q=${encodeURIComponent(q ?? '')}`, `page=${page}`, `size=${size}`];
    if (country) parts.push(`country=${encodeURIComponent(country)}`);
    if (department) parts.push(`department=${encodeURIComponent(department)}`);
    if (municipality) parts.push(`municipality=${encodeURIComponent(municipality)}`);
    if (type) parts.push(`type=${encodeURIComponent(type)}`);
    return this.api.get(elPath(`locations/neighborhoods?${parts.join('&')}`));
  }

  /** Busca por nombre de barrio/vereda y trae la cadena padre completa. */
  searchByNeighborhood(q: string, page = 0, size = 20): Observable<SearchPage<LocationHit>> {
    return this.api.get(elPath(`locations/by-neighborhood?q=${encodeURIComponent(q)}&page=${page}&size=${size}`));
  }

  // ===================== Helpers para el autocomplete =====================

  /**
   * Adaptador listo para `<app-autocomplete [searchFn]>`. Cada metodo devuelve
   * una funcion `(term) => Observable<AutocompleteOption[]>` que cumple con la
   * regla "minimo 3 letras" del back (con menos retorna lista vacia).
   *
   * El `value` de la opcion es el `code` (clave estable y legible). Si necesitas
   * el id, esta en `meta.id` (junto al hit crudo).
   */
  searchFn = {
    countries: () => (term: string) => this.guarded(term, () =>
      this.searchCountries(term).pipe(map(r => r.items.map(hit => this.toOption(hit, 'country'))))),

    departments: (countryCode?: string) => (term: string) => this.guarded(term, () =>
      this.searchDepartments(term, countryCode).pipe(map(r => r.items.map(hit => this.toOption(hit, 'department'))))),

    municipalities: (countryCode?: string, departmentCode?: string) => (term: string) => this.guarded(term, () =>
      this.searchMunicipalities(term, countryCode, departmentCode).pipe(map(r => r.items.map(hit => this.toOption(hit, 'municipality'))))),

    neighborhoods: (countryCode?: string, departmentCode?: string, municipalityCode?: string, type?: NeighborhoodType) => (term: string) => this.guarded(term, () =>
      this.searchNeighborhoods(term, countryCode, departmentCode, municipalityCode, type).pipe(map(r => r.items.map(hit => this.toOption(hit, 'neighborhood'))))),
  };

  private guarded(term: string, run: () => Observable<AutocompleteOption[]>): Observable<AutocompleteOption[]> {
    if (!term || term.trim().length < 3) {
      return new Observable<AutocompleteOption[]>(sub => { sub.next([]); sub.complete(); });
    }
    return run();
  }

  private toOption(hit: LocationHit, level: 'country' | 'department' | 'municipality' | 'neighborhood'): AutocompleteOption {
    let value: string = '';
    let label: string = '';
    switch (level) {
      case 'country':
        value = hit.countryCode ?? hit.countryId ?? '';
        label = hit.countryName ?? value;
        break;
      case 'department':
        value = hit.departmentCode ?? hit.departmentId ?? '';
        label = `${hit.departmentName ?? value}${hit.countryName ? ` · ${hit.countryName}` : ''}`;
        break;
      case 'municipality':
        value = hit.municipalityCode ?? hit.municipalityId ?? '';
        label = `${hit.municipalityName ?? value}${hit.departmentName ? ` · ${hit.departmentName}` : ''}`;
        break;
      case 'neighborhood':
        value = hit.neighborhoodCode ?? hit.neighborhoodId ?? '';
        label = `${hit.neighborhoodName ?? value}${hit.municipalityName ? ` · ${hit.municipalityName}` : ''}`;
        break;
    }
    return { value, label, meta: { hit, level } };
  }
}
