import { Observable } from 'rxjs';

/**
 * Opcion del autocomplete. Compatible con `Option` de los dynamic-forms,
 * intencionalmente reusada para que el wrapper de form no tenga que mapear.
 */
export interface AutocompleteOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

/**
 * Funcion de busqueda asincrona. Recibe el termino tipeado por el usuario
 * y devuelve un observable con las opciones a mostrar. Se invoca con
 * debounce por el componente.
 */
export type AutocompleteSearchFn = (term: string) => Observable<AutocompleteOption[]>;
