import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';

///TODO  evaluar si crear un endpoint especifico para TypeDocumnet o Usar Systemlist
import { SystemListsApi, CatalogItem } from '../system-lists/system-lists.api';

/**
 * Formulario para la administración de terceros.
 *
 * PERSON:
 *  - Documento
 *  - Nombres
 *  - Apellidos
 *
 * COMPANY:
 *  - Documento
 *  - Razón social
 *  - Nombre comercial
 */
export function buildThirdPartySchema(
    systemListsApi: SystemListsApi,
    mode: 'create' | 'edit'
): FormSchema {

  return {

    cols: 12,

    fields: [

      {
        key: 'type',
        type: 'select',
        label: 'Tipo de tercero',
        width: 'half',
        defaultValue: 'PERSON',
        validators: ['required'],
        options: [
          { value: 'PERSON', label: 'Persona' },
          { value: 'COMPANY', label: 'Empresa' },
        ]
      },

    {
        key: 'documentTypeId',
        type: 'select',
        label: 'Tipo de documento',
        width: 'half',
        validators: ['required'],
        options: () =>
            systemListsApi
                .itemsEnabled('document_type')
                .pipe(
                    map<CatalogItem[], Option[]>(items =>
                        items.map(item => ({
                            value: item.id,
                            label: item.name
                        }))
                    )
                )
    },

      {
        key: 'documentNumber',
        type: 'text',
        label: 'Número de documento',
        width: 'half',
        validators: [
          'required',
          { kind: 'maxLength', value: 50 }
        ]
      },

      // ==========================
      // PERSONA
      // ==========================

      {
        key: 'firstName',
        type: 'text',
        label: 'Primer nombre',
        width: 'half',
        visibleWhen: form => form.get('type')?.value === 'PERSON',
        validators: [
          'required',
          { kind: 'maxLength', value: 80 }
        ]
      },

      {
        key: 'secondName',
        type: 'text',
        label: 'Segundo nombre',
        width: 'half',
        visibleWhen: form => form.get('type')?.value === 'PERSON',
        validators: [
          { kind: 'maxLength', value: 80 }
        ]
      },

      {
        key: 'firstLastName',
        type: 'text',
        label: 'Primer apellido',
        width: 'half',
        visibleWhen: form => form.get('type')?.value === 'PERSON',
        validators: [
          'required',
          { kind: 'maxLength', value: 80 }
        ]
      },

      {
        key: 'secondLastName',
        type: 'text',
        label: 'Segundo apellido',
        width: 'half',
        visibleWhen: form => form.get('type')?.value === 'PERSON',
        validators: [
          { kind: 'maxLength', value: 80 }
        ]
      },

      // ==========================
      // EMPRESA
      // ==========================

      {
        key: 'businessName',
        type: 'text',
        label: 'Razón social',
        width: 'full',
        visibleWhen: form => form.get('type')?.value === 'COMPANY',
        validators: [
          'required',
          { kind: 'maxLength', value: 200 }
        ]
      },

      {
        key: 'tradeName',
        type: 'text',
        label: 'Nombre comercial',
        width: 'full',
        visibleWhen: form => form.get('type')?.value === 'COMPANY',
        validators: [
          { kind: 'maxLength', value: 200 }
        ]
      },

      // ==========================
      // CONTACTO
      // ==========================

      {
        key: 'email',
        type: 'email',
        label: 'Correo electrónico',
        width: 'half',
        validators: [
          'email'
        ]
      },

      {
        key: 'phone',
        type: 'text',
        label: 'Teléfono',
        width: 'half',
        validators: [
          { kind: 'maxLength', value: 30 }
        ]
      },

      {
        key: 'active',
        type: 'checkbox',
        label: 'Activo',
        width: 'full',
        defaultValue: true
      }

    ],

    submit: {
      label:
        mode === 'create'
          ? 'Crear tercero'
          : 'Guardar cambios'
    }

  };

}