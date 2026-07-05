import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi } from '../system-lists/system-lists.api';
import { CatalogItem } from '../system-lists/system-lists.model';

/**
 * Formulario de DATOS BASE del tercero (persona natural).
 * Los contactos y direcciones se gestionan en sus propias secciones
 * (consumo individual), no en este formulario.
 */
export function buildThirdPartySchema(
  systemListsApi: SystemListsApi,
  mode: 'create' | 'edit'
): FormSchema {

  const catalog = (name: string) => () =>
    systemListsApi.itemsEnabled(name).pipe(
      map<CatalogItem[], Option[]>(items => items.map(i => ({ value: i.id, label: i.name })))
    );

  return {
    cols: 12,
    fields: [
      {
        key: 'documentTypeId', type: 'select', label: 'Tipo de documento', width: 'half',
        validators: ['required'], options: catalog('document_type'),
      },
      {
        key: 'documentNumber', type: 'text', label: 'Número de documento', width: 'half',
        validators: ['required', { kind: 'maxLength', value: 40 }],
      },
      {
        key: 'firstName', type: 'text', label: 'Primer nombre', width: 'half',
        validators: ['required', { kind: 'maxLength', value: 80 }],
      },
      {
        key: 'secondName', type: 'text', label: 'Segundo nombre', width: 'half',
        validators: [{ kind: 'maxLength', value: 80 }],
      },
      {
        key: 'firstLastName', type: 'text', label: 'Primer apellido', width: 'half',
        validators: ['required', { kind: 'maxLength', value: 80 }],
      },
      {
        key: 'secondLastName', type: 'text', label: 'Segundo apellido', width: 'half',
        validators: [{ kind: 'maxLength', value: 80 }],
      },
      {
        key: 'genderId', type: 'select', label: 'Género', width: 'half',
        options: catalog('gender'),
      },
      {
        key: 'birthDate', type: 'date', label: 'Fecha de nacimiento', width: 'half',
      },
      {
        key: 'photoUrl', type: 'text', label: 'Foto (URL)', width: 'full',
        validators: [{ kind: 'maxLength', value: 500 }],
      },
    ],
    submit: {
      label: mode === 'create' ? 'Crear tercero' : 'Guardar cambios',
    },
  };
}
