import { FormSchema } from '../../../shared/forms/core/types';

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
 * Alta MÍNIMA de un empleado: solo la cuenta para la app móvil (usuario,
 * correo, contraseña) — la sede viene del contexto de la vista. El tercero y
 * el registro laboral nacen vacíos (shells con FKs) y el propio empleado
 * completa sus datos en su primer ingreso al APK: un dueño no se sienta a
 * digitar los datos personales de todo su equipo.
 */
export const EMPLOYEE_PROVISION_SCHEMA: FormSchema = {
  cols: 12,
  fields: [
    {
      key: 'username', type: 'text', label: 'Usuario', width: 'full',
      validators: ['required', { kind: 'maxLength', value: 60 }],
      hint: 'Con este usuario (o el correo) el empleado entra a la app móvil.',
    },
    {
      key: 'email', type: 'email', label: 'Correo', width: 'full',
      validators: ['required', 'email', { kind: 'maxLength', value: 120 }],
    },
    {
      key: 'password', type: 'password', label: 'Contraseña temporal', width: 'full',
      validators: ['required', { kind: 'minLength', value: 8 }],
      hint: 'Mínimo 8 caracteres. El empleado podrá cambiarla luego.',
    },
  ],
  submit: { show: false },
};
