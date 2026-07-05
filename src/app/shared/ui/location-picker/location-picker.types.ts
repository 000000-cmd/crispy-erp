import { AutocompleteOption } from '../autocomplete/autocomplete.types';

/** Selección emitida por el picker jerárquico de localización. */
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
