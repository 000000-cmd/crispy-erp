# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-app-versions.spec.ts >> Versiones del APK >> subir al histórico (sin publicar), validar y eliminar
- Location: e2e\05-app-versions.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row', { name: /999\.0\.10/ }).getByText(/Histórica|Historic/)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row', { name: /999\.0\.10/ }).getByText(/Histórica|Historic/)

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
    - text: / Versiones del APK
  - radiogroup "Idioma":
    - radio "ES" [checked]
    - radio "EN"
  - button "Activar modo oscuro": tema
  - button "Notificaciones":
    - img
- main:
  - heading "Versiones del APK" [level=1]
  - paragraph: Sube, publica y distribuye la app móvil. Los teléfonos exigen la versión vigente.
  - button "Copiar link de descarga":
    - img
    - text: Copiar link de descarga
  - button "Subir versión":
    - img
    - text: Subir versión
  - table:
    - rowgroup:
      - row "Versión Code Tamaño SHA-256 Subida Estado Acciones":
        - columnheader "Versión"
        - columnheader "Code"
        - columnheader "Tamaño"
        - columnheader "SHA-256"
        - columnheader "Subida"
        - columnheader "Estado"
        - columnheader "Acciones"
    - rowgroup:
      - row "Sin resultados":
        - cell "Sin resultados":
          - img
          - paragraph: Sin resultados
  - paragraph: "El link de descarga es estable: siempre sirve la versión vigente. Para que los teléfonos actualicen sin perder datos, cada versión debe firmarse con la misma llave y subir el versionCode."
- region "Notificaciones"
- dialog:
  - banner:
    - heading "Subir versión del APK" [level=3]
    - button "Cerrar":
      - img
  - text: Archivo APK *
  - img
  - text: saas-app-999.0.10.apk
  - paragraph: Compilado en release y firmado con la llave oficial.
  - text: Versión *
  - textbox "1.0.1": 999.0.10
  - paragraph: Formato x.y.z
  - text: versionCode *
  - spinbutton: "1783810461"
  - paragraph: Entero creciente (Android)
  - text: Notas de la versión
  - textbox "Correcciones y mejoras"
  - paragraph: El usuario las ve en el aviso de actualización.
  - text: Publicar al subir
  - switch "Queda vigente de inmediato (sincroniza VERAPP)"
  - text: Queda vigente de inmediato (sincroniza VERAPP)
  - contentinfo:
    - button "Cerrar"
    - button "Guardar"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { byPlaceholder, drawer, expectToast, loginAdmin } from './support/helpers';
  3  | 
  4  | /**
  5  |  * Distribución del APK (admin): validaciones de subida, histórico y borrado.
  6  |  * Se sube SIN publicar para no mover VERAPP ni la vigente del entorno, con una
  7  |  * versión única por corrida (el histórico es UNIQUE por Version/VersionCode).
  8  |  */
  9  | test.describe('Versiones del APK', () => {
  10 | 
  11 |   test('subir al histórico (sin publicar), validar y eliminar', async ({ page }) => {
  12 |     const now = Date.now();
  13 |     const version = `999.0.${now % 1000}`;
  14 |     const versionCode = String(Math.floor(now / 1000)); // epoch-seconds: entero creciente
  15 |     const versionRe = new RegExp(version.replace(/\./g, '\\.'));
  16 | 
  17 |     await loginAdmin(page);
  18 |     await page.goto('/admin/app-versions');
  19 |     await expect(page.getByRole('button', { name: /Copiar link de descarga|Copy download link/ })).toBeVisible();
  20 | 
  21 |     await page.getByRole('button', { name: /Subir versión|Upload version/ }).click();
  22 |     const d = drawer(page);
  23 |     const guardar = d.getByRole('button', { name: /Guardar|Save/ });
  24 |     await expect(guardar).toBeDisabled(); // sin archivo no hay subida
  25 | 
  26 |     // Archivo fake .apk: el back solo exige extensión y bytes (checksum real).
  27 |     await d.locator('input[type="file"]').setInputFiles({
  28 |       name: `saas-app-${version}.apk`,
  29 |       mimeType: 'application/vnd.android.package-archive',
  30 |       buffer: Buffer.from('PK-e2e-fake-apk-content'),
  31 |     });
  32 |     // La versión se sugiere desde el nombre del archivo.
  33 |     await expect(byPlaceholder(d, '1.0.1')).toHaveValue(version);
  34 |     await byPlaceholder(d, '2').fill(versionCode);
  35 |     // Apagar "Publicar al subir" → queda solo en el histórico.
  36 |     await d.locator('button.app-switch').click();
  37 |     await expect(guardar).toBeEnabled();
  38 |     await guardar.click();
  39 |     await expectToast(page, versionRe);
  40 | 
  41 |     const row = page.getByRole('row', { name: versionRe });
> 42 |     await expect(row.getByText(/Histórica|Historic/)).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  43 | 
  44 |     // Limpieza: eliminar del histórico (borrado FÍSICO: registro + binario).
  45 |     await row.getByTitle(/Eliminar|Delete/).click();
  46 |     await page.locator('app-confirm-host').getByRole('button', { name: /Eliminar|Delete/ }).click();
  47 |     await expectToast(page, /Versión eliminada|Version deleted/);
  48 |     await expect(page.getByRole('row', { name: versionRe })).toHaveCount(0);
  49 |   });
  50 | });
  51 | 
```