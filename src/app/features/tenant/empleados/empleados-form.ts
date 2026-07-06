import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { SystemListsApi } from '../../admin/system-lists/system-lists.api';
import { CatalogItem } from '../../admin/system-lists/system-lists.model';
import { ConstantsService } from '../../../core/constants/constants.service';

/** Estado del formulario de edición laboral (cargo/código/fecha). */
export interface EmployeeEditForm {
  personName: string;
  positionId: string | null;
  employeeCode: string;
  hireDate: string;
}

export const EMPTY_EMPLOYEE_EDIT_FORM: EmployeeEditForm = {
  personName: '',
  positionId: null,
  employeeCode: '',
  hireDate: '',
};

/**
 * Alta COMPLETA de un empleado (el dueño la hace desde su dashboard):
 * datos laborales + persona + cuenta para la app móvil. La sede viene del
 * contexto de la vista (selector), no del formulario.
 */
export function buildEmployeeProvisionSchema(systemListsApi: SystemListsApi, constants: ConstantsService): FormSchema {
  const catalog = (name: string) => () =>
    systemListsApi.itemsEnabled(name).pipe(
      map<CatalogItem[], Option[]>(items => items.map(i => ({ value: i.id, label: i.name })))
    );

  return {
    cols: 12,
    fields: [
      // ---- Laboral ----
      { key: 'positionId', type: 'select', label: 'Cargo', width: 'half', validators: ['required'], options: catalog('employee_position') },
      { key: 'hireDate', type: 'date', label: 'Fecha de ingreso', width: 'half', validators: ['required'] },
      { key: 'employeeCode', type: 'text', label: 'Código interno', width: 'half', validators: [{ kind: 'maxLength', value: 40 }] },

      // ---- Persona ----
      { key: 'documentTypeId', type: 'select', label: 'Tipo de documento', width: 'half', validators: ['required'], options: catalog('document_type') },
      { key: 'documentNumber', type: 'text', label: 'Número de documento', width: 'half', validators: ['required', { kind: 'maxLength', value: 40 }] },
      { key: 'firstName', type: 'text', label: 'Primer nombre', width: 'half', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'secondName', type: 'text', label: 'Segundo nombre', width: 'half', validators: [{ kind: 'maxLength', value: 80 }] },
      { key: 'firstLastName', type: 'text', label: 'Primer apellido', width: 'half', validators: ['required', { kind: 'maxLength', value: 80 }] },
      { key: 'secondLastName', type: 'text', label: 'Segundo apellido', width: 'half', validators: [{ kind: 'maxLength', value: 80 }] },
      { key: 'genderId', type: 'select', label: 'Género', width: 'half', options: catalog('gender') },
      // Mayoría de edad por constante MAYEDAD (si está inhabilitada/no existe, se omite).
      { key: 'birthDate', type: 'date', label: 'Fecha de nacimiento', validators: [{ async: constants.legalAgeValidator() }] },

      // ---- Cuenta para la app móvil ----
      {
        key: 'email', type: 'email', label: 'Correo (acceso a la app)', width: 'full',
        validators: ['required', 'email', { kind: 'maxLength', value: 120 }],
        hint: 'Con este correo y contraseña el empleado entra a la app móvil.',
      },
      { key: 'username', type: 'text', label: 'Usuario', width: 'half', validators: ['required', { kind: 'maxLength', value: 60 }] },
      {
        key: 'password', type: 'password', label: 'Contraseña temporal', width: 'half',
        validators: ['required', { kind: 'minLength', value: 8 }],
        hint: 'Mínimo 8 caracteres. El empleado podrá cambiarla luego.',
      },
    ],
    submit: { show: false },
  };
}
