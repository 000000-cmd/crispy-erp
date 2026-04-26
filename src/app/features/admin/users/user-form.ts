import { map } from 'rxjs';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { Role, RolesApi } from '../roles/roles.api';

export function buildUserSchema(rolesApi: RolesApi, mode: 'create' | 'edit'): FormSchema {
  return {
    cols: 12,
    fields: [
      {
        key: 'fullName', type: 'text', label: 'Nombre completo',
        placeholder: 'Ej. Carolina Vega',
        width: 'half',
        validators: ['required', { kind: 'minLength', value: 2 }],
      },
      {
        key: 'email', type: 'email', label: 'Correo',
        placeholder: 'usuario@empresa.com',
        width: 'half',
        disabled: mode === 'edit',
        validators: ['required', 'email'],
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
        key: 'roleIds', type: 'checkbox-group', label: 'Roles', width: 'full', multiple: true,
        options: () => rolesApi.list().pipe(
          map<Role[], Option[]>(rs => rs.map(r => ({ value: r.id, label: r.name })))
        ),
      },
      {
        key: 'enabled', type: 'switch', label: 'Habilitado', width: 'half', defaultValue: true,
        visibleWhen: () => mode === 'edit',
      },
    ],
    submit: { label: mode === 'create' ? 'Crear usuario' : 'Guardar cambios' },
  };
}
