# crispy-erp — Guía del frontend

> Stack: **Angular 20** standalone, **Tailwind 4**, **Lucide** icons, **ag-grid** + **echarts** (opcionales).
> Estilo: signals first, sin NgModules, sin `*ngIf/*ngFor` (usar `@if/@for`).

---

## Tabla de contenidos

1. [Arrancar el proyecto](#1-arrancar-el-proyecto)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Capas](#3-capas)
4. [Capa `core/`](#4-capa-core)
   1. [HTTP — `ApiService` + interceptores](#41-http--apiservice--interceptores)
   2. [Auth — `AuthService`, guards, tipos](#42-auth--authservice-guards-tipos)
   3. [Theme — paletas + dark/light + custom](#43-theme--paletas--darklight--custom)
   4. [i18n — `I18nService` y pipe `| t`](#44-i18n--i18nservice-y-pipe--t)
   5. [Menu — sidebar dinámico desde el back](#45-menu--sidebar-dinámico-desde-el-back)
5. [Capa `shared/ui/`](#5-capa-sharedui)
6. [⭐ DynamicForm — guía completa](#6-dynamicform--guía-completa)
   1. [Conceptos](#61-conceptos)
   2. [Anatomía del schema](#62-anatomía-del-schema)
   3. [Tipos de campo soportados](#63-tipos-de-campo-soportados)
   4. [Validators](#64-validators)
   5. [Visibilidad / disabled / required reactivos](#65-visibilidad--disabled--required-reactivos)
   6. [Hooks: `onInit`, `onChange`, `onBlur`](#66-hooks-oninit-onchange-onblur)
   7. [Opciones (estáticas, función, observable, dependientes)](#67-opciones-estáticas-función-observable-dependientes)
   8. [Layout y `width`](#68-layout-y-width)
   9. [Custom components (escape hatch)](#69-custom-components-escape-hatch)
   10. [Recetas rápidas](#610-recetas-rápidas)
7. [DataTable](#7-datatable)
8. [Layouts y rutas](#8-layouts-y-rutas)
9. [Cookbook: añadir una feature nueva](#9-cookbook-añadir-una-feature-nueva)
10. [Convenciones de estilo / código](#10-convenciones-de-estilo--código)

---

## 1. Arrancar el proyecto

```bash
cd crispy-erp
npm install
npm start              # ng serve → http://localhost:4200
npm run build          # producción
```

Configurar el endpoint del back en `src/environments/environments.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',   // sin /api — el gateway expone rutas limpias
  appName: 'ERP Moda',
};
```

> El gateway **debe** tener el origen `http://localhost:4200` en `saas.cors.allowed-origins`. Ver doc del back, sección 13.

---

## 2. Estructura de carpetas

```
src/
├── environments/
│   ├── environments.ts            ← apiUrl dev
│   └── environments.prod.ts       ← apiUrl prod
├── styles.css                     ← Tailwind 4 + variables CSS del tema
└── app/
    ├── app.ts                     ← <app-root> (boot de servicios)
    ├── app.config.ts              ← providers (HttpClient, interceptores, router)
    ├── app.routes.ts              ← rutas raíz
    │
    ├── core/                      ← singletons app-wide (sin componentes)
    │   ├── auth/                  ← AuthService, guards, tipos, TokenStorage
    │   ├── http/                  ← ApiService, ApiResponse, interceptores
    │   ├── theme/                 ← ThemeService, paletas
    │   ├── i18n/                  ← I18nService, diccionarios
    │   └── menu/                  ← MenuService (sidebar dinámico) + MenusApi
    │
    ├── shared/                    ← reusables (componentes, pipes, utilidades)
    │   ├── ui/                    ← Button, Card, Pill, Modal, Toast, Switch...
    │   ├── forms/                 ← ⭐ DynamicForm engine (core + fields)
    │   ├── table/                 ← DataTable
    │   └── pipes/                 ← TPipe
    │
    ├── layouts/                   ← shells (admin/tenant/auth) + sidebar/topbar
    │   ├── admin-layout/
    │   ├── tenant-layout/
    │   ├── auth-layout/
    │   └── shell/                 ← sidebar.component, topbar.component, breadcrumbs, layout-state, icon-resolver
    │
    └── features/                  ← una carpeta por feature (lazy-loaded)
        ├── auth/login/
        ├── admin/
        │   ├── dashboard/  users/  roles/  permissions/  menus/
        │   ├── constants/  system-lists/  profile/  stubs/
        │   └── admin.routes.ts
        └── tenant/
            ├── dashboard/  profile/  ...
            └── tenant.routes.ts
```

**Regla simple**: `core/` es lo que existe una sola vez en toda la app. `shared/` es lo que se reutiliza entre features. `features/` es código de negocio organizado por dominio.

---

## 3. Capas

```
┌─────────────────── features/* (CRUDs, dashboards, flujos) ───────────────────┐
│                                                                              │
│   pages.ts ─── usa ───▶ shared/ui/*  +  shared/forms/*  +  shared/table/*    │
│       │                                                                      │
│       └── usa ───▶ feature/<name>.api.ts (HttpClient tipado)                 │
│                            │                                                 │
│                            └── usa ───▶ core/http/ApiService                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                          core/auth, core/theme, core/i18n, core/menu (singletons globales)
```

- Las **features no se importan entre sí**. Si dos features necesitan algo, sube a `shared/`.
- Los **layouts** sólo dependen de `core/` y `shared/`. No conocen a las features.
- Los **services API** viven dentro de su feature: `features/admin/users/users.api.ts`.

---

## 4. Capa `core/`

### 4.1 HTTP — `ApiService` + interceptores

Un wrapper finito sobre `HttpClient` que:
- Concatena la URL con `environment.apiUrl`.
- Desempaqueta el envelope `ApiResponse<T>` y devuelve solo `data`.
- Construye `HttpParams` ignorando `null`/`undefined`/`''`.

```ts
// Inyectar y usar
private readonly api = inject(ApiService);

this.api.get<User[]>('users');                          // → Observable<User[]>
this.api.get<User>(`users/${id}`);
this.api.post<User>('users', { email, password });
this.api.put<User>(`users/${id}`, payload);
this.api.delete<void>(`users/${id}`);
this.api.get<Page<User>>('users', { page: 0, size: 20 });
```

**Interceptores** registrados en `app.config.ts`:

| Interceptor | Hace |
|---|---|
| `authInterceptor` | Lee el access token de `TokenStorage` y añade `Authorization: Bearer <token>` |
| `errorInterceptor` | 401 → limpia storage + redirect a `/login`. 403 → toast "sin permisos". 5xx → toast "error del servidor". Resto → toast con `error.message` |

### 4.2 Auth — `AuthService`, guards, tipos

```ts
private readonly auth = inject(AuthService);

this.auth.login({ usernameOrEmail, password });   // Observable<AuthUser>
this.auth.logout();                               // best-effort POST /auth/logout + limpia storage + redirect
this.auth.user();                                 // signal con AuthUser | null
this.auth.isAuthenticated();                      // computed
this.auth.kind();                                 // 'SYSTEM_ADMIN' | 'TENANT_USER' | null
this.auth.hasRole('ADMIN');                       // boolean
this.auth.homeRoute();                            // '/admin' o '/tenant'
this.auth.refreshMe();                            // GET /users/me → actualiza signal
```

`AuthUser` se deriva de `UserResponse` del back. El campo `kind` se infiere de `roleCodes`:

```ts
const SYSTEM_ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN']);
```

> Si añades roles en el back que deberían ir al panel admin, edita esa constante en `core/auth/auth.service.ts`.

**Guards** (`core/auth/guards.ts`):

```ts
{
  path: 'admin',
  canActivate: [authGuard, kindGuard('SYSTEM_ADMIN')],   // exige login + kind correcto
  // ...
}

{
  path: 'login',
  canActivate: [guestGuard],                              // bloquea si ya está logueado
}

// Por roles específicos:
canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')]          // pasa si tiene cualquiera
```

### 4.3 Theme — paletas + dark/light + custom

```ts
private readonly theme = inject(ThemeService);

this.theme.mode();                   // 'light' | 'dark' (signal)
this.theme.toggleMode();
this.theme.setMode('dark');

this.theme.palettes;                 // PRESET_PALETTES (terracota, índigo, violeta, ...)
this.theme.paletteId();              // signal del id activo
this.theme.setPalette('emerald');

this.theme.customHex();              // signal del hex custom
this.theme.setCustomHex('#a13a2c');  // genera escala 50–900 desde un hex y la activa
```

Cómo funciona: el servicio inserta variables CSS (`--p-50` a `--p-900`) en `<html>`. Tailwind las consume vía `@theme` en `styles.css` (`bg-primary-500`, `text-primary-700`, etc.).

**Para añadir una paleta nueva**: edita `core/theme/palettes.ts`:

```ts
export const PRESET_PALETTES: Palette[] = [
  // ...
  { id: 'pizarra', label: 'Pizarra', scale: scaleFromHue(255, 0.04) },
];
```

### 4.4 i18n — `I18nService` y pipe `| t`

```ts
private readonly i18n = inject(I18nService);

this.i18n.locale();                 // 'es' | 'en' (signal)
this.i18n.setLocale('en');
this.i18n.t('common.save');         // → 'Guardar' o 'Save'
this.i18n.t('validation.min', { n: 5 });   // → 'Mínimo 5'
```

Pipe en templates:

```html
<button>{{ 'common.save' | t }}</button>
<p>{{ 'validation.minLength' | t : { n: 8 } }}</p>
```

**Para añadir una clave**: edita los dos diccionarios en `core/i18n/dictionaries.ts`:

```ts
export const DICTIONARIES = {
  es: { 'mi.feature.titulo': 'Mi título' },
  en: { 'mi.feature.titulo': 'My title' },
};
```

> Para añadir un idioma completo (ej. `pt`), añade `'pt'` a `Locale`, crea el bloque `pt: { ... }` y agrega `'pt'` a `available` en `I18nService`.

### 4.5 Menu — sidebar dinámico desde el back

`MenuService` carga `GET /menus/me` cuando hay usuario logueado y reactivamente lo limpia al hacer logout.

```ts
private readonly menus = inject(MenuService);

this.menus.tree();          // signal con árbol crudo del back
this.menus.sections();      // signal con NavSection[] listo para el sidebar
this.menus.loaded();        // signal boolean
this.menus.load();          // forzar recarga
```

El sidebar consume `sections()`. Los iconos vienen como string (`shield-check`, `users`, etc.) y los resuelve `layouts/shell/icon-resolver.ts`.

**Para soportar un icono nuevo**: añádelo al mapa de `icon-resolver.ts`:

```ts
import { Sparkles } from 'lucide-angular';
const MAP: Record<string, any> = {
  // ...
  sparkles: Sparkles,
};
```

---

## 5. Capa `shared/ui/`

Componentes reusables. Todos `standalone`, todos con `input()`/`output()` (no `@Input`/`@Output` legacy).

| Componente | Selector | Inputs principales |
|---|---|---|
| Button | `<app-button>` | `variant` (`primary\|secondary\|ghost\|danger\|subtle`), `size` (`sm\|md\|lg`), `icon`, `loading`, `disabled`, `block`, `type` |
| Card | `<app-card>` | `title`, `subtitle`, `padded` |
| Pill | `<app-pill>` | `tone` (`neutral\|primary\|success\|warning\|danger\|info`), `soft` |
| IconBadge | `<app-icon-badge>` | `icon`, `text`, `tone`, `size` |
| Switch | `<app-switch>` | implementa `ControlValueAccessor` (usable con `[formControl]` o `[(ngModel)]`) |
| Modal | `<app-modal>` | `open`, `title`, `size` (`sm\|md\|lg\|xl`), evento `(onClose)` + slot `[modalFooter]` |
| Tabs | `<app-tabs>` | `tabs: TabItem[]`, `[(active)]` |
| Empty | `<app-empty>` | `icon`, `title`, `description` |
| Spinner | `<app-spinner>` | `size` (px) |
| Toast | servicio | `inject(ToastService).success/info/warning/error(msg)` |
| Confirm | servicio | `await inject(ConfirmService).ask({ title, message, tone, confirmText })` → boolean |

### Ejemplo: confirmación + toast

```ts
async deleteUser(u: User) {
  const ok = await this.confirm.ask({
    title: 'Eliminar usuario',
    message: `¿Eliminar a ${u.email}?`,
    tone: 'danger',
    confirmText: 'Eliminar',
  });
  if (!ok) return;

  this.api.remove(u.id).subscribe(() => {
    this.toast.success('Usuario eliminado');
    this.refresh();
  });
}
```

### Ejemplo: modal con footer

```html
<app-modal [open]="!!editing()" title="Editar" size="lg" (onClose)="close()">
  @if (editing()) {
    <app-dynamic-form [schema]="schema" [model]="editing()!" (submitValue)="save($event)" />
  }
  @if (editing()) {
    <div modalFooter class="px-5 py-3 border-t border-border flex justify-end gap-2">
      <app-button variant="ghost" (onClick)="close()">Cancelar</app-button>
    </div>
  }
</app-modal>
```

> ⚠️ El contenido del slot `[modalFooter]` debe estar en su propio `@if` (no junto al body) para que Angular pueda proyectarlo. Ver "Recetas rápidas" abajo.

---

## 6. ⭐ DynamicForm — guía completa

Este es el componente más importante del shared. Permite definir un formulario **declarativamente** (un objeto `FormSchema`) y obtener al instante: layout en grid, validación, reactividad, hooks de ciclo de vida, soporte para selects async, dependencias entre campos, etc.

### 6.1 Conceptos

- **API pública**: signals + objetos planos. **Implementación interna**: Reactive Forms (`FormGroup` + `FormControl`). Lo mejor de los dos mundos.
- Un schema describe **qué campos** existen, **cómo se ven**, **cómo se validan** y **cómo reaccionan** a cambios.
- Cada campo es un `FieldConfig` independiente. Sin restricciones — si necesitas algo que el motor no cubre, usa `customComponent`.

### 6.2 Anatomía del schema

```ts
import { FormSchema } from '@app/shared/forms/core/types';

const schema: FormSchema = {
  cols: 12,                            // grid de 12 columnas (default)
  layout: 'grid',                      // 'grid' | 'stack' (default 'grid')
  submit: { label: 'Guardar', show: true },
  fields: [
    {
      key: 'email',                    // nombre del control en el FormGroup
      type: 'email',                   // tipo de campo
      label: 'Correo',
      placeholder: 'tu@empresa.com',
      hint: 'Será tu usuario para iniciar sesión',
      defaultValue: '',
      width: 'half',                   // 'full' | 'half' | 'third' | 'quarter' | <n>
      validators: ['required', 'email'],
      visibleWhen: (form) => form.get('createAccount')?.value === true,
      disabledWhen: (form) => false,
      requiredWhen: (form) => false,
      hooks: {
        onBlur: (value, ctx) => { /* lookup, etc. */ },
        onChange: (value, ctx) => {},
        onInit:  (ctx) => {},
      },
      meta: { /* libre */ },
    },
    // ... más campos
  ],
};
```

### Uso

```html
<app-dynamic-form
  [schema]="schema"
  [model]="initialValue"          <!-- Record<string, any> opcional -->
  [submitting]="saving()"         <!-- bloquea el botón submit -->
  (submitValue)="onSubmit($event)"
  (valueChange)="onChange($event)"
/>
```

```ts
import { DynamicFormComponent } from '@app/shared/forms/dynamic-form.component';
import { FormSchema } from '@app/shared/forms/core/types';

@Component({
  imports: [DynamicFormComponent],
  // ...
})
export class MyPage {
  readonly saving = signal(false);
  readonly schema: FormSchema = { /* ... */ };

  onSubmit(value: Record<string, any>) {
    this.saving.set(true);
    this.api.create(value).subscribe(() => this.saving.set(false));
  }
}
```

### 6.3 Tipos de campo soportados

```ts
type FieldType =
  | 'text' | 'email' | 'password' | 'number' | 'textarea'
  | 'select' | 'multiselect' | 'autocomplete'
  | 'radio' | 'checkbox-group' | 'checkbox' | 'switch'
  | 'date' | 'time' | 'datetime'
  | 'file' | 'color' | 'hidden'
  | 'custom';
```

| Tipo | Renderizado | Notas |
|---|---|---|
| `text`, `email`, `password`, `number`, `date`, `time`, `datetime`, `color` | `<input>` HTML nativo | Mapea al type HTML correspondiente |
| `textarea` | `<textarea>` | 4 filas por defecto |
| `select` | `<select>` simple | Lee `options` |
| `multiselect` | `<select multiple>` | Valor es `string[]` |
| `radio` | grupo de radios | Selección única, lee `options` |
| `checkbox-group` | grupo de checkboxes | Multi por defecto (valor `array`); `multiple: false` lo vuelve exclusivo |
| `checkbox` | un solo checkbox | Valor `boolean` (label se muestra inline) |
| `switch` | `<app-switch>` | Valor `boolean`; label inline |
| `file` | `<input type=file>` | Valor `File \| null` |
| `hidden` | nada (no renderiza) | Útil para mantener un valor en el form sin UI |
| `custom` | tu propio componente | Ver §6.9 |

### 6.4 Validators

```ts
validators: [
  'required',
  'email',
  { kind: 'minLength', value: 8, message: 'validation.minLength' },
  { kind: 'maxLength', value: 120 },
  { kind: 'min', value: 0 },
  { kind: 'max', value: 100 },
  { kind: 'pattern', value: /^[A-Z0-9_]+$/, message: 'Solo mayúsculas y _' },

  // Custom sync (recibe AbstractControl, devuelve null o ValidationErrors)
  (c) => c.value && c.value.includes(' ')
    ? { spaces: { message: 'No se permiten espacios' } }
    : null,

  // Async (raras)
  { async: (c) => myService.exists(c.value).pipe(map(ok => ok ? null : { taken: { message: 'Ya existe' } })) },
],
```

**Mensajes**: las claves `validation.required`, `validation.email`, etc., están en `dictionaries.ts`. Si pasas un `message` string que coincide con una clave, se traduce automáticamente. Si no, se muestra literal.

**Comparar con otro campo** (ej. confirmación de password):

```ts
{
  key: 'confirm', type: 'password', label: 'Confirmar',
  validators: [
    'required',
    (c) => c.value && c.parent?.get('password')?.value !== c.value
      ? { match: { message: 'No coincide' } }
      : null,
  ],
}
```

### 6.5 Visibilidad / disabled / required reactivos

Tres predicados opcionales por campo, reevaluados **en cada cambio del form**:

```ts
{
  key: 'tipoEmpresa',
  type: 'text',
  label: 'Tipo de empresa',
  // Solo visible si el "tipo de cliente" es "EMPRESA"
  visibleWhen: (form) => form.get('tipoCliente')?.value === 'EMPRESA',

  // Deshabilita si la cuenta está inactiva
  disabledWhen: (form) => form.get('enabled')?.value === false,

  // Required dinámico (extiende los validators existentes)
  requiredWhen: (form) => form.get('tipoCliente')?.value === 'EMPRESA',
}
```

Cuando un campo es invisible, su control se `disable()` automáticamente — no se incluye en `getRawValue()` del submit. Cuando vuelve a ser visible, se `enable()`.

### 6.6 Hooks: `onInit`, `onChange`, `onBlur`

Los hooks reciben un `ctx` con todo lo necesario:

```ts
interface FieldHookCtx {
  form: FormGroup;                       // todo el form
  control: AbstractControl;              // el control de este campo
  field: FieldConfig;                    // este FieldConfig
  injector: EnvironmentInjector;         // para inject() dentro del hook
  value: any;                            // shorthand para control.value
  setValue: (key: string, val: any) => void;
  patch: (patch: Record<string, any>) => void;
}
```

#### Ejemplo: lookup al perder foco

```ts
{
  key: 'codigo',
  type: 'text',
  label: 'Código de cliente',
  hooks: {
    onBlur: async (value, ctx) => {
      if (!value) return;
      const api = ctx.injector.get(ClientesApi);
      try {
        const cli = await firstValueFrom(api.findByCode(value));
        // Auto-llenar otros campos
        ctx.patch({ nombre: cli.nombre, email: cli.email });
      } catch {
        // No existe — limpia los campos relacionados
        ctx.patch({ nombre: '', email: '' });
      }
    },
  },
}
```

#### Ejemplo: cascada (al cambiar país, recargar departamentos)

```ts
{
  key: 'pais',
  type: 'select',
  label: 'País',
  options: () => paisesApi.list().pipe(map(...)),
  hooks: {
    onChange: (value, ctx) => {
      ctx.patch({ departamento: null, ciudad: null });
    },
  },
},
{
  key: 'departamento',
  type: 'select',
  label: 'Departamento',
  // Las opciones se recalculan automáticamente cuando cambia el contexto
  options: (ctx) => {
    const pais = ctx.form.get('pais')?.value;
    if (!pais) return of([]);
    const api = ctx.injector.get(GeoApi);
    return api.departamentos(pais).pipe(map(ds => ds.map(d => ({ value: d.id, label: d.nombre }))));
  },
}
```

> **Nota**: las opciones derivadas se cargan al iniciar el form. Para cascada real (re-carga al cambiar otro campo), usa `onChange` en el campo padre y reasigna el modelo o invalida el cache.

#### `onInit`

Útil para precargar algo cuando el form arranca:

```ts
hooks: {
  onInit: (ctx) => {
    if (!ctx.value) ctx.control.setValue(generarCodigoSugerido());
  },
}
```

### 6.7 Opciones (estáticas, función, observable, dependientes)

Aplica a `select`, `multiselect`, `radio`, `checkbox-group`, `autocomplete`.

```ts
// 1. Estáticas
options: [
  { value: 'STRING',  label: 'Texto' },
  { value: 'NUMBER',  label: 'Número' },
  { value: 'BOOLEAN', label: 'Booleano', disabled: true },
],

// 2. Función que devuelve array
options: () => [
  { value: 1, label: 'Activo' },
  { value: 0, label: 'Inactivo' },
],

// 3. Función que devuelve Observable (típico para cargar del back)
options: () => rolesApi.list().pipe(
  map(rs => rs.map(r => ({ value: r.id, label: r.name })))
),

// 4. Función que recibe el ctx (para opciones dependientes)
options: (ctx) => {
  const tipo = ctx.form.get('tipo')?.value;
  if (tipo === 'CLIENTE') return clientesApi.list().pipe(map(...));
  if (tipo === 'PROVEEDOR') return provApi.list().pipe(map(...));
  return of([]);
},
```

`Option` shape:

```ts
interface Option {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  group?: string;     // para agrupar (no usado actualmente, reservado)
  meta?: Record<string, unknown>;
}
```

### 6.8 Layout y `width`

El form se renderiza en un grid CSS de `cols` columnas (default 12). Cada campo ocupa columnas según `width`:

| `width` | Columnas que ocupa (cuando `cols=12`) |
|---|---|
| `'full'` (default) | 12 |
| `'half'` | 6 |
| `'third'` | 4 |
| `'quarter'` | 3 |
| `<number>` | exactamente ese número |

Ejemplo de form con dos campos lado a lado y luego uno full:

```ts
fields: [
  { key: 'firstName', type: 'text', label: 'Nombres',   width: 'half' },
  { key: 'lastName',  type: 'text', label: 'Apellidos', width: 'half' },
  { key: 'email',     type: 'email', label: 'Correo',   width: 'full' },
],
```

### 6.9 Custom components (escape hatch)

Cuando necesitas algo que el motor no soporta (ej. un selector de mapa, un editor markdown, un picker visual de imagen), usa `type: 'custom'`:

```ts
import { MapPickerComponent } from './map-picker.component';

{
  key: 'ubicacion',
  type: 'custom',
  label: 'Ubicación',
  customComponent: MapPickerComponent,
  meta: { zoom: 13, center: [4.65, -74.1] },
}
```

Tu componente recibe automáticamente dos inputs:

```ts
@Component({ /* ... */ })
export class MapPickerComponent {
  readonly field   = input.required<FieldConfig>();
  readonly control = input.required<AbstractControl>();

  pick(coords: { lat: number; lng: number }) {
    this.control().setValue(coords);
    this.control().markAsDirty();
    this.control().markAsTouched();
  }
}
```

### 6.10 Recetas rápidas

#### Login

```ts
readonly schema: FormSchema = {
  cols: 1,
  fields: [
    { key: 'usernameOrEmail', type: 'text',     label: 'Usuario o correo', validators: ['required'] },
    { key: 'password',        type: 'password', label: 'Contraseña',
      validators: ['required', { kind: 'minLength', value: 6 }] },
  ],
  submit: { label: 'Iniciar sesión' },
};
```

#### CRUD con campos opcionales según modo

```ts
function buildSchema(mode: 'create' | 'edit'): FormSchema {
  return {
    cols: 12,
    fields: [
      { key: 'email', type: 'email', label: 'Correo', width: 'half',
        disabled: mode === 'edit',
        validators: ['required', 'email'] },

      { key: 'password', type: 'password', label: 'Contraseña', width: 'half',
        visibleWhen: () => mode === 'create',
        validators: mode === 'create' ? ['required', { kind: 'minLength', value: 8 }] : [] },

      { key: 'enabled', type: 'switch', label: 'Habilitado', width: 'half',
        defaultValue: true,
        visibleWhen: () => mode === 'edit' },
    ],
  };
}
```

#### Asignación de items con checkbox-group

```ts
{
  key: 'roleIds',
  type: 'checkbox-group',
  label: 'Roles',
  multiple: true,                    // permite varios (default)
  options: () => rolesApi.list().pipe(
    map(rs => rs.map(r => ({ value: r.id, label: r.name })))
  ),
}
```

#### Selección única en checkbox (vs radio)

```ts
{
  key: 'unico',
  type: 'checkbox-group',
  multiple: false,                   // exclusivo
  options: [...],
}
```

#### Validación cruzada (requerido si X)

```ts
{
  key: 'razonSocial', type: 'text', label: 'Razón social',
  requiredWhen: (form) => form.get('tipo')?.value === 'EMPRESA',
}
```

#### Form sin botón submit (controlado por padre)

```ts
schema: {
  submit: { show: false },
  fields: [...],
}

// Trigger desde fuera:
@ViewChild(DynamicFormComponent) df?: DynamicFormComponent;
save() { this.df?.submit(); }    // disparará (submitValue) si es válido
```

#### Reaccionar a cambios sin submit

```html
<app-dynamic-form [schema]="schema" (valueChange)="preview = $event" />
```

```ts
preview: any = {};
```

---

## 7. DataTable

Tabla simple con columnas tipadas, acciones por fila, estados loading/empty.

```ts
import { ColumnDef, DataTableComponent, RowAction } from '@app/shared/table/data-table.component';

readonly columns: ColumnDef<User>[] = [
  { key: 'fullName', label: 'Nombre',  format: r => r.fullName || '—' },
  { key: 'email',    label: 'Correo' },
  { key: 'enabled' as any, label: 'Estado', align: 'center', format: r => r.enabled ? 'Activo' : 'Inactivo' },
];

readonly actions: RowAction<User>[] = [
  { icon: Pencil, label: 'Editar',  tone: 'primary', onClick: r => this.openEdit(r) },
  { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
];
```

```html
<app-data-table [columns]="columns" [rows]="users()" [actions]="actions" [loading]="loading()" />
```

> Para tablas con paginación server-side, virtualización o filtros complejos, está disponible `ag-grid-angular` (ya viene en `package.json`).

---

## 8. Layouts y rutas

### Estructura

- `auth-layout` — split panel + form (login).
- `admin-layout` — sidebar con secciones de admin + topbar + breadcrumbs + outlet.
- `tenant-layout` — sidebar con secciones de tenant + idem.

Cada layout consume `MenuService.sections()`. Si el back todavía no respondió, usa el fallback estático (`admin-nav.ts` / `tenant-nav.ts`) para que el usuario nunca vea el sidebar vacío.

### Sidebar dual-mode

`LayoutStateService` mantiene un signal `mode: 'expanded' | 'collapsed'` persistido en localStorage.

- **Expanded** (256px): secciones colapsables con título uppercase, items con icono + label + chevron.
- **Collapsed** (64px): rail con solo iconos. Al hacer hover sobre un item con sub-items, aparece un **flyout** flotante con la lista completa.

Toggle desde el botón hamburger del topbar:

```ts
inject(LayoutStateService).toggle();
```

### Rutas

`app.routes.ts` define los 3 entrypoints lazy:

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login',  loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: 'tenant', loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES) },
  { path: '**', redirectTo: 'login' },
];
```

Cada `*.routes.ts` aplica el guard adecuado y declara las rutas hijas con `loadComponent` para code splitting:

```ts
export const ADMIN_ROUTES: Routes = [{
  path: '',
  component: AdminLayoutComponent,
  canActivate: [authGuard, kindGuard('SYSTEM_ADMIN')],
  data: { crumb: 'Admin' },
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: 'users', data: { crumb: 'Usuarios' }, loadComponent: () => import('./users/users.page').then(m => m.AdminUsersPage) },
    // ...
  ],
}];
```

`data.crumb` lo lee `BreadcrumbsComponent` para construir la migaja de pan.

---

## 9. Cookbook: añadir una feature nueva

Ejemplo: agregar un CRUD de "categorías" bajo `/tenant/inventario/categorias`.

### Paso 1: API service

`features/tenant/inventario/categorias/categorias.api.ts`:

```ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';

export interface Categoria { id: string; code: string; name: string; enabled: boolean; }

@Injectable({ providedIn: 'root' })
export class CategoriasApi {
  private readonly api = inject(ApiService);
  list(): Observable<Categoria[]>                  { return this.api.get('categorias'); }
  create(p: Partial<Categoria>): Observable<Categoria> { return this.api.post('categorias', p); }
  update(id: string, p: Partial<Categoria>): Observable<Categoria> { return this.api.put(`categorias/${id}`, p); }
  remove(id: string): Observable<void>             { return this.api.delete(`categorias/${id}`); }
}
```

### Paso 2: page

`features/tenant/inventario/categorias/categorias.page.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { ColumnDef, DataTableComponent, RowAction } from '@app/shared/table/data-table.component';
import { DynamicFormComponent } from '@app/shared/forms/dynamic-form.component';
import { FormSchema } from '@app/shared/forms/core/types';
import { ConfirmService } from '@app/shared/ui/confirm/confirm.service';
import { ToastService } from '@app/shared/ui/toast/toast.service';
import { Categoria, CategoriasApi } from './categorias.api';

@Component({
  selector: 'app-tenant-categorias',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, ModalComponent, DataTableComponent, DynamicFormComponent],
  template: `
    <div class="space-y-5">
      <header class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">Categorías</h1>
          <p class="text-sm text-text-muted mt-0.5">Categorización de productos.</p>
        </div>
        <app-button [icon]="plusIcon" (onClick)="open(null)">Nueva</app-button>
      </header>

      <app-data-table [columns]="columns" [rows]="rows()" [actions]="actions" [loading]="loading()" />

      <app-modal [open]="!!editing()" [title]="editing()?.id ? 'Editar' : 'Nueva'" (onClose)="close()">
        @if (editing()) {
          <app-dynamic-form [schema]="schema" [model]="editing()!" [submitting]="saving()" (submitValue)="save($event)" />
        }
      </app-modal>
    </div>
  `,
})
export class TenantCategoriasPage {
  private readonly api = inject(CategoriasApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly plusIcon = Plus;

  readonly rows = signal<Categoria[]>([]);
  readonly loading = signal(false);
  readonly editing = signal<Partial<Categoria> | null>(null);
  readonly saving = signal(false);

  readonly columns: ColumnDef<Categoria>[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'enabled' as any, label: 'Estado', format: r => r.enabled ? 'Activa' : 'Inactiva' },
  ];

  readonly actions: RowAction<Categoria>[] = [
    { icon: Pencil, label: 'Editar', tone: 'primary', onClick: r => this.open(r) },
    { icon: Trash2, label: 'Eliminar', tone: 'danger', onClick: r => this.askDelete(r) },
  ];

  readonly schema: FormSchema = {
    cols: 12,
    fields: [
      { key: 'code', type: 'text', label: 'Código', width: 'half',
        validators: ['required', { kind: 'pattern', value: /^[A-Z0-9_]+$/ }] },
      { key: 'name', type: 'text', label: 'Nombre', width: 'half', validators: ['required'] },
      { key: 'enabled', type: 'switch', label: 'Habilitada', width: 'full', defaultValue: true },
    ],
  };

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: r => { this.rows.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(c: Categoria | null) { this.editing.set(c ? { ...c } : { enabled: true }); }
  close() { this.editing.set(null); }

  save(v: any) {
    const e = this.editing()!;
    this.saving.set(true);
    const obs = e.id ? this.api.update(e.id, v) : this.api.create(v);
    obs.subscribe({
      next: () => { this.toast.success('Guardado'); this.saving.set(false); this.close(); this.refresh(); },
      error: () => this.saving.set(false),
    });
  }

  async askDelete(c: Categoria) {
    const ok = await this.confirm.ask({ title: 'Eliminar', message: `¿Eliminar "${c.code}"?`, tone: 'danger' });
    if (!ok) return;
    this.api.remove(c.id).subscribe(() => { this.toast.success('Eliminada'); this.refresh(); });
  }
}
```

### Paso 3: ruta

En `features/tenant/tenant.routes.ts`, dentro del array `children`:

```ts
{
  path: 'inventario/categorias',
  data: { crumb: 'Categorías' },
  loadComponent: () => import('./inventario/categorias/categorias.page').then(m => m.TenantCategoriasPage),
},
```

### Paso 4: menú

Si el back tiene el menú sembrado (`/menus/me`), aparece automáticamente. Si todavía no, añádelo al fallback `tenant-nav.ts`:

```ts
{ key: 'inv_cat', label: 'Categorías', icon: Tags, path: '/tenant/inventario/categorias' },
```

**Eso es todo.** No hay registro central de componentes, módulos, providers globales — todo lo que necesitas vive en la propia carpeta de la feature.

---

## 10. Convenciones de estilo / código

### TypeScript

- **Standalone components siempre.** No NgModules.
- **Signals por defecto.** Usa `input()`, `output()`, `signal()`, `computed()`. Evita `@Input/@Output` legacy y `BehaviorSubject` salvo cuando interopere con código RxJS existente.
- **`inject()` en lugar de constructor injection** en todos los componentes/services nuevos:
  ```ts
  // ✅
  private readonly api = inject(MyApi);

  // ❌
  constructor(private api: MyApi) {}
  ```
- **`readonly` para todo lo que no muta.** Signals, inyecciones, schemas, columns.

### Templates

- **Usa control flow nuevo**: `@if`, `@for (track ...)`, `@switch`. No `*ngIf`/`*ngFor`.
- **Trackeo obligatorio** en `@for`: `track item.id`.
- **Iconos con `lucide-angular`**:
  ```ts
  import { LucideAngularModule, Plus } from 'lucide-angular';
  protected readonly plusIcon = Plus;
  ```
  ```html
  <lucide-icon [img]="plusIcon" [size]="16" />
  ```

### Estilos

- **Tailwind 4 con tokens del tema**: usa `bg-primary-500`, `text-text-muted`, `border-border` — **no** colores Tailwind por defecto (`bg-blue-500`). Esto garantiza que el tema (paleta + dark/light) funcione siempre.
- Tokens disponibles: `primary-{50..900}`, `text`, `text-muted`, `text-soft`, `surface`, `surface-muted`, `surface-hover`, `border`, `border-strong`, `bg`.
- Para dark mode, usa la variante `dark:`. Las CSS variables ya cambian automáticamente cuando el modo cambia.
- **No escribas CSS custom** salvo en `styles.css` global o en bloques `styles: [...]` de un componente cuando es estrictamente necesario (animaciones, etc.).

### Naming

| Tipo | Convención | Ejemplo |
|---|---|---|
| Pages | `<feature>.page.ts` | `users.page.ts` |
| Components | `<name>.component.ts` | `card.component.ts` |
| Services | `<name>.service.ts` o `<name>.api.ts` | `auth.service.ts`, `users.api.ts` |
| Tipos | `<name>.types.ts` | `auth.types.ts` |
| Rutas | `<feature>.routes.ts` | `admin.routes.ts` |
| Selector componentes shared | `app-<name>` | `<app-button>` |
| Selector pages | `app-<area>-<feature>` | `<app-admin-users>` |
| Selector field components | `df-<name>-field` | `<df-text-field>` |

### Accesibilidad

- Botones siempre tienen `type="button"` por defecto. Sólo el botón de submit del form va sin tipo (el `DynamicForm` ya lo hace).
- Inputs siempre tienen `<label>` asociado (en `DynamicForm` se hace automáticamente).
- Modales se cierran con click fuera y respetan focus.

---

## Apéndice — Atajos útiles

### Forzar recarga del menú tras crear/editar uno

Después de modificar menús desde `/admin/menus`, llama a:

```ts
inject(MenuService).load(true);   // force=true ignora el cache
```

### Saber si el usuario tiene un permiso específico

```ts
this.auth.hasRole('ADMIN');                          // por código de rol
// permisos efectivos: pegar a /roles/{id}/permissions del rol del usuario y cachear
```

### Cambiar la URL del back en runtime (debug)

```js
// En la consola del navegador:
localStorage.setItem('erp.apiUrl', 'http://otro-host:8080');
location.reload();
```

> Nota: requiere modificar `environments.ts` para que lea de `localStorage` primero. Ahora mismo es estático — lo añadimos cuando lo necesites.

---

**Última actualización**: 2026-04-26 — versión inicial post-refactor a Angular 20 + DynamicForm engine.
