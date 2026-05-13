import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { Role, RolesApi } from '../roles/roles.api';

/**
 * Schema alineado a CreateUserRequest / UpdateUserRequest del back:
 * username, email, password, firstName, lastName, theme, languageCode, profilePhoto, roleIds.
 */
export function buildUserSchema(rolesApi: RolesApi, mode: 'create' | 'edit'): FormSchema {
  return {
    cols: 12,
    fields: [
      {
        key: 'username', type: 'text', label: 'Usuario',
        placeholder: 'cvega',
        width: 'half',
        disabled: mode === 'edit',
        validators: ['required', { kind: 'minLength', value: 3 }, { kind: 'maxLength', value: 60 }],
      },
      {
        key: 'email', type: 'email', label: 'Correo',
        placeholder: 'usuario@empresa.com',
        width: 'half',
        disabled: mode === 'edit',
        validators: ['required', 'email'],
      },
      {
        key: 'firstName', type: 'text', label: 'Nombres',
        placeholder: 'Carolina',
        width: 'half',
        validators: ['required', { kind: 'maxLength', value: 80 }],
      },
      {
        key: 'lastName', type: 'text', label: 'Apellidos',
        placeholder: 'Vega',
        width: 'half',
        validators: ['required', { kind: 'maxLength', value: 80 }],
      },
      {
        key: 'password', type: 'password', label: 'Contraseña',
        placeholder: 'Mínimo 8 caracteres',
        width: 'half',
        visibleWhen: () => mode === 'create',
        validators: mode === 'create' ? ['required', { kind: 'minLength', value: 8 }] : [],
      },
      {
        key: 'passwordConfirm', type: 'password', label: 'Confirmar contraseña',
        width: 'half',
        visibleWhen: () => mode === 'create',
        validators: mode === 'create'
          ? ['required', (c => c.value && c.parent?.get('password')?.value !== c.value ? { match: { message: 'Las contraseñas no coinciden' } } : null)]
          : [],
      },
      {
        key: 'languageCode', type: 'select', label: 'Idioma', width: 'half', defaultValue: 'es-CO',
        options: [
          { value: 'es-CO', label: 'Español (CO)' },
          { value: 'en-US', label: 'English (US)' },
        ],
      },
      {
        key: 'theme', type: 'select', label: 'Tema', width: 'half', defaultValue: 'light',
        options: [
          { value: 'light', label: 'Claro' },
          { value: 'dark',  label: 'Oscuro' },
        ],
      },
      {
        key: 'roleIds', type: 'multiselect', label: 'Roles', width: 'full',
        searchable: true, searchPlaceholder: 'Buscar rol…', selectAll: true,
        placeholder: 'Selecciona uno o varios roles…',
        validators: ['required'],
        options: () => rolesApi.list().pipe(
          map<Role[], Option[]>(rs => rs.map(r => ({ value: r.id, label: r.name })))
        ),
      },
    ],
    submit: { label: mode === 'create' ? 'Crear usuario' : 'Guardar cambios' },
  };
}
