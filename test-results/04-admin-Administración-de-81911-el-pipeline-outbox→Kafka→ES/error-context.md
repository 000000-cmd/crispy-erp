# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-admin.spec.ts >> Administración del sistema >> terceros: crear en BD y verlo llegar por el pipeline outbox→Kafka→ES
- Location: e2e\04-admin.spec.ts:34:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Tercero creado correctamente').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Tercero creado correctamente').first()

```

```yaml
- complementary:
  - text: EM
  - paragraph: ERP Moda
  - paragraph: Admin sistema
  - navigation:
    - button "Panel":
      - text: Panel
      - img
    - list:
      - listitem:
        - link "Panel":
          - /url: /admin/dashboard
          - img
          - text: Panel
    - button "Usuarios":
      - text: Usuarios
      - img
    - list:
      - listitem:
        - link "Todos los usuarios":
          - /url: /admin/users
          - img
          - text: Todos los usuarios
      - listitem:
        - link "Invitaciones":
          - /url: /admin/invitations
          - img
          - text: Invitaciones
    - button "Terceros":
      - text: Terceros
      - img
    - list:
      - listitem:
        - link "Terceros":
          - /url: /admin/thirdparty
          - img
          - text: Terceros
    - button "Empresas":
      - text: Empresas
      - img
    - list:
      - listitem:
        - link "Empresas":
          - /url: /admin/business
          - img
          - text: Empresas
    - button "Sistema":
      - text: Sistema
      - img
    - list:
      - listitem:
        - link "Listas":
          - /url: /admin/system-lists
          - img
          - text: Listas
      - listitem:
        - link "Constantes":
          - /url: /admin/constants
          - img
          - text: Constantes
      - listitem:
        - link "Menus":
          - /url: /admin/menus
          - img
          - text: Menus
      - listitem:
        - link "Division politica":
          - /url: /admin/political-division
          - img
          - text: Division politica
      - listitem:
        - link "Estado del sistema":
          - /url: /admin/system-status
          - img
          - text: Estado del sistema
      - listitem:
        - link "Versiones del APK":
          - /url: /admin/app-versions
          - img
          - text: Versiones del APK
    - button "Seguridad":
      - text: Seguridad
      - img
    - list:
      - listitem:
        - link "Roles":
          - /url: /admin/roles
          - img
          - text: Roles
      - listitem:
        - link "Permisos":
          - /url: /admin/permissions
          - img
          - text: Permisos
      - listitem:
        - link "Auditoria":
          - /url: /admin/audit
          - img
          - text: Auditoria
    - button "Preferencias":
      - text: Preferencias
      - img
    - list:
      - listitem:
        - link "Mi perfil":
          - /url: /admin/profile
          - img
          - text: Mi perfil
  - button "Administrador Sistema Administrador Sistema admin@saas.local":
    - text: AS
    - paragraph: Administrador Sistema
    - paragraph: admin@saas.local
    - button "Cerrar sesión":
      - img
- banner:
  - button "Contraer menú":
    - img
  - navigation:
    - link "Admin":
      - /url: /admin
    - text: / Terceros
  - radiogroup "Idioma":
    - radio "ES" [checked]
    - radio "EN"
  - button "Activar modo oscuro": tema
  - button "Notificaciones":
    - img
- main:
  - heading "Terceros" [level=1]
  - paragraph: Administra la información de personas y empresas registradas en el sistema.
  - button "Nuevo tercero":
    - img
    - text: Nuevo tercero
  - img
  - textbox "Buscar por nombre o documento…"
  - table:
    - rowgroup:
      - row "Documento Nombre Habilitado Acciones":
        - columnheader "Documento"
        - columnheader "Nombre"
        - columnheader "Habilitado"
        - columnheader "Acciones"
    - rowgroup:
      - row "123456789 Juan Carlos Perez Rodriguez Activo":
        - cell "123456789"
        - cell "Juan Carlos Perez Rodriguez"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "987654321 Maria Fernanda Gomez Lopez Activo":
        - cell "987654321"
        - cell "Maria Fernanda Gomez Lopez"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9gnbt9j372 Owner Prueba e2egnbt9j327 Activo":
        - cell "9gnbt9j372"
        - cell "Owner Prueba e2egnbt9j327"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "7bi8xzq43 Tercero E2E Activo":
        - cell "7bi8xzq43"
        - cell "Tercero E2E"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "7bizg2x938 Tercero E2E Activo":
        - cell "7bizg2x938"
        - cell "Tercero E2E"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "124123123 123 21d1 12312 d12d12 Activo":
        - cell "124123123"
        - cell "123 21d1 12312 d12d12"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "018927391762 prueba prueba Activo":
        - cell "018927391762"
        - cell "prueba prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "8cvznto915 Empleado Prueba Activo":
        - cell "8cvznto915"
        - cell "Empleado Prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "7cvznto795 Tercero E2E Activo":
        - cell "7cvznto795"
        - cell "Tercero E2E"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "8bi8xzq627 Empleado Prueba Activo":
        - cell "8bi8xzq627"
        - cell "Empleado Prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9cwjc9i926 Owner Operativo Activo":
        - cell "9cwjc9i926"
        - cell "Owner Operativo"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9bizg2x340 Owner Operativo Activo":
        - cell "9bizg2x340"
        - cell "Owner Operativo"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "8gnbt9j260 Empleado Prueba Activo":
        - cell "8gnbt9j260"
        - cell "Empleado Prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "8cwjc9i663 Empleado Prueba Activo":
        - cell "8cwjc9i663"
        - cell "Empleado Prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9bi8xzq39 Owner Operativo Activo":
        - cell "9bi8xzq39"
        - cell "Owner Operativo"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9cvznto934 Owner Operativo Activo":
        - cell "9cvznto934"
        - cell "Owner Operativo"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "7cwjc9i976 Tercero E2E Activo":
        - cell "7cwjc9i976"
        - cell "Tercero E2E"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "12312313 prueba prueba Activo":
        - cell "12312313"
        - cell "prueba prueba"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "9gnkf6z473 Owner Prueba e2egnkf6z584 Activo":
        - cell "9gnkf6z473"
        - cell "Owner Prueba e2egnkf6z584"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
      - row "7gnbt9j487 Tercero E2E Activo":
        - cell "7gnbt9j487"
        - cell "Tercero E2E"
        - cell "Activo"
        - cell:
          - button "Visualizar":
            - img
          - button "Editar":
            - img
          - button "Reindexar":
            - img
          - button "Eliminar":
            - img
  - text: 39 resultados
  - button [disabled]:
    - img
  - text: Página 1 de 2
  - button:
    - img
- region "Notificaciones"
- dialog:
  - banner:
    - heading "Nuevo tercero" [level=3]
    - button "Cerrar":
      - img
  - text: Tipo de documento
  - button "Cedula de Ciudadania":
    - text: Cedula de Ciudadania
    - img
  - listbox:
    - option "Cedula de Ciudadania" [selected]
    - option "Tarjeta de Identidad"
    - option "Cedula de Extranjeria"
    - option "Pasaporte"
    - option "NIT"
  - text: Número de documento
  - textbox: 7gyngs9360
  - text: Primer nombre
  - textbox: Tercero
  - text: Segundo nombre
  - textbox
  - text: Primer apellido
  - textbox: E2E
  - text: Segundo apellido
  - textbox
  - text: Género
  - button "Selecciona…":
    - text: Selecciona…
    - img
  - listbox:
    - option "Masculino"
    - option "Femenino"
    - option "Otro"
  - text: Fecha de nacimiento
  - textbox
  - text: Foto (URL)
  - textbox
  - contentinfo:
    - button "Cancelar"
    - button "Guardar"
- dialog:
  - banner:
    - heading "Detalle del tercero" [level=3]
    - button "Cerrar":
      - img
- dialog:
  - banner:
    - heading "Reindexar tercero" [level=3]
    - button "Cerrar":
      - img
  - paragraph: "Contrasta el documento indexado en Elasticsearch (base + contactos + direcciones) con el mismo detalle en la base de datos. Si difieren, el índice está desactualizado: reindexa para regenerarlo."
  - text: Al día Elasticsearch (indexado) No indexado null Base de datos (completo) null
  - button "Cancelar"
  - button "Reindexar"
```

# Test source

```ts
  1   | import { APIRequestContext, Locator, Page, expect } from '@playwright/test';
  2   | 
  3   | export const GATEWAY = 'http://localhost:8080';
  4   | export const ADMIN = { user: 'admin', pass: 'Admin123!' };
  5   | 
  6   | /** Sufijo único por corrida para no chocar con datos previos (BD dev compartida). */
  7   | export const runId = Date.now().toString(36).slice(-6);
  8   | 
  9   | export function unique(prefix: string): string {
  10  |   return `${prefix}${runId}${Math.floor(Math.random() * 1000)}`;
  11  | }
  12  | 
  13  | // ---------------- UI ----------------
  14  | 
  15  | /**
  16  |  * El input REAL por placeholder. `app-input` replica el atributo en su host,
  17  |  * así que getByPlaceholder daría 2 matches (strict violation).
  18  |  */
  19  | export function byPlaceholder(scope: Page | Locator, placeholder: string): Locator {
  20  |   return scope.locator(`input[placeholder="${placeholder}"]`);
  21  | }
  22  | 
  23  | /** El drawer se portalea a <body>; este es su panel. */
  24  | export function drawer(page: Page): Locator {
  25  |   return page.locator('aside[role="dialog"]');
  26  | }
  27  | 
  28  | export async function loginAdmin(page: Page): Promise<void> {
  29  |   await page.goto('/login/admin');
  30  |   await byPlaceholder(page, 'admin  /  admin@sistema.com').fill(ADMIN.user);
  31  |   await byPlaceholder(page, '••••••••').fill(ADMIN.pass);
  32  |   await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  33  |   await page.waitForURL('**/admin/**');
  34  | }
  35  | 
  36  | /**
  37  |  * Wizard público de registro de dueño (MÍNIMO, solo cuenta). Devuelve las
  38  |  * credenciales creadas. Los datos del negocio ya NO se piden aquí: se completan
  39  |  * en el onboarding / widget del dashboard.
  40  |  */
  41  | export async function registerOwner(page: Page) {
  42  |   const suffix = unique('e2e');
  43  |   const creds = {
  44  |     firstName: 'Owner',
  45  |     lastName: `Prueba ${suffix}`,
  46  |     email: `${suffix}@e2e.local`,
  47  |     username: suffix,
  48  |     password: 'Password123!',
  49  |   };
  50  |   await page.goto('/login/register');
  51  |   // Paso 1 (Cuenta): nombre, apellido, correo, usuario, contraseña (una columna).
  52  |   const inputs = page.locator('input');
  53  |   await inputs.nth(0).fill(creds.firstName);   // Nombre
  54  |   await inputs.nth(1).fill(creds.lastName);    // Apellido
  55  |   await byPlaceholder(page, 'tu@correo.com').fill(creds.email);
  56  |   await inputs.nth(3).fill(creds.username);    // Usuario
  57  |   await byPlaceholder(page, 'Mínimo 8 caracteres').fill(creds.password);
  58  |   await page.getByRole('button', { name: 'Continuar' }).click();
  59  |   // Paso 2 (Confirmar) → crear (el stepper anima ~650ms; el getByRole auto-espera).
  60  |   await page.getByRole('button', { name: 'Crear cuenta' }).click();
  61  |   await page.waitForURL('**/tenant/**', { timeout: 20_000 });
  62  |   return creds;
  63  | }
  64  | 
  65  | /**
  66  |  * Abre el select N (dynamic-form) dentro del scope y elige una opción del
  67  |  * PANEL ABIERTO (los cerrados quedan en el DOM con opacity-0).
  68  |  */
  69  | export async function pickSelect(page: Page, scope: Page | Locator, index: number, optionName?: string | RegExp) {
  70  |   const triggers = scope.locator('div.relative:has(> div[role="listbox"]) > button');
  71  |   await triggers.nth(index).click();
  72  |   const openPanel = page.locator('.app-dropdown.is-open');
  73  |   const option = optionName
  74  |     ? openPanel.getByRole('option', { name: optionName }).first()
  75  |     : openPanel.getByRole('option').first();
  76  |   await option.click();
  77  | }
  78  | 
  79  | export async function expectToast(page: Page, text: string | RegExp) {
> 80  |   await expect(page.getByText(text).first()).toBeVisible({ timeout: 15_000 });
      |                                              ^ Error: expect(locator).toBeVisible() failed
  81  | }
  82  | 
  83  | /** Loguea respuestas HTTP fallidas del back en el output del test. */
  84  | export function logHttpErrors(page: Page) {
  85  |   page.on('response', res => {
  86  |     if (res.status() >= 400) {
  87  |       // eslint-disable-next-line no-console
  88  |       console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
  89  |     }
  90  |   });
  91  | }
  92  | 
  93  | // ---------------- API (para preparar datos sin depender de la UI) ----------------
  94  | 
  95  | export async function apiLogin(
  96  |   request: APIRequestContext,
  97  |   usernameOrEmail: string,
  98  |   password: string,
  99  | ): Promise<{ token: string; userId: string }> {
  100 |   const res = await request.post(`${GATEWAY}/auth/login`, {
  101 |     data: { usernameOrEmail, email: usernameOrEmail, password },
  102 |   });
  103 |   expect(res.ok(), `login API ${res.status()}`).toBeTruthy();
  104 |   const body = await res.json();
  105 |   return { token: body.data.tokens.accessToken as string, userId: body.data.user.id as string };
  106 | }
  107 | 
  108 | export async function apiGet(request: APIRequestContext, token: string, path: string) {
  109 |   const res = await request.get(`${GATEWAY}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  110 |   expect(res.ok(), `GET ${path} -> ${res.status()}`).toBeTruthy();
  111 |   return (await res.json()).data;
  112 | }
  113 | 
  114 | /**
  115 |  * Garantiza items en un catálogo (vía admin). Cubre entornos cuya BD se migró
  116 |  * antes de que el seed trajera items de business_type/branch_type.
  117 |  */
  118 | export async function ensureCatalogItems(
  119 |   request: APIRequestContext,
  120 |   adminToken: string,
  121 |   catalog: string,
  122 |   items: Array<{ code: string; name: string }>,
  123 | ) {
  124 |   const existing = await apiGet(request, adminToken, `/system/list/${catalog}/enabled`);
  125 |   if (Array.isArray(existing) && existing.length > 0) return;
  126 |   for (const [i, it] of items.entries()) {
  127 |     await apiPost(request, adminToken, `/system/list/${catalog}`, { ...it, displayOrder: i + 1 });
  128 |   }
  129 | }
  130 | 
  131 | export async function apiPost(request: APIRequestContext, token: string, path: string, data: unknown) {
  132 |   const res = await request.post(`${GATEWAY}${path}`, {
  133 |     headers: { Authorization: `Bearer ${token}` },
  134 |     data,
  135 |   });
  136 |   expect(res.ok(), `POST ${path} -> ${res.status()}: ${await res.text()}`).toBeTruthy();
  137 |   return (await res.json()).data;
  138 | }
  139 | 
```