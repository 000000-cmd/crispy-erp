/**
 * Modelos de localización (país → departamento → municipio → barrio/vereda).
 * Espejo del CRUD de system-service y del read model de search-service.
 */

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
