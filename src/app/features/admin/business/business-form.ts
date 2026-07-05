import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi } from '../system-lists/system-lists.api';
import { CatalogItem } from '../system-lists/system-lists.model';

/**
 * Formulario de datos base de la empresa. Los selects (tipo de negocio, estado,
 * tipo de documento) se nutren de catálogos del sistema. El slug/dominios se
 * gestionan aparte (sección de dominios), no aquí.
 */
export function buildBusinessSchema(systemListsApi: SystemListsApi, mode: 'create' | 'edit'): FormSchema {
  const catalog = (name: string) => () =>
    systemListsApi.itemsEnabled(name).pipe(
      map<CatalogItem[], Option[]>(items => items.map(i => ({ value: i.id, label: i.name })))
    );

  return {
    cols: 12,
    fields: [
      { key: 'businessTypeId', type: 'select', label: 'Tipo de negocio', width: 'half', validators: ['required'], options: catalog('business_type') },
      { key: 'statusId', type: 'select', label: 'Estado', width: 'half', options: catalog('status') },
      { key: 'name', type: 'text', label: 'Nombre', width: 'full', validators: ['required', { kind: 'maxLength', value: 160 }] },
      { key: 'legalName', type: 'text', label: 'Razón social', width: 'half', validators: [{ kind: 'maxLength', value: 200 }] },
      { key: 'tradeName', type: 'text', label: 'Nombre comercial', width: 'half', validators: [{ kind: 'maxLength', value: 160 }] },
      { key: 'documentTypeId', type: 'select', label: 'Tipo de documento', width: 'half', options: catalog('document_type') },
      { key: 'documentNumber', type: 'text', label: 'Número de documento', width: 'half', validators: [{ kind: 'maxLength', value: 40 }] },
      { key: 'logoUrl', type: 'text', label: 'Logo (URL)', width: 'full', validators: [{ kind: 'maxLength', value: 500 }] },
      { key: 'primaryColor', type: 'text', label: 'Color primario', width: 'half', validators: [{ kind: 'maxLength', value: 20 }] },
      { key: 'secondaryColor', type: 'text', label: 'Color secundario', width: 'half', validators: [{ kind: 'maxLength', value: 20 }] },
    ],
    submit: { show: false },
  };
}
