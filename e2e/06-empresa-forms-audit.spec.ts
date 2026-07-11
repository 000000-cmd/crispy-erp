import { expect, test, type Page, type Locator } from '@playwright/test';
import {
  ADMIN, apiLogin, byPlaceholder, drawer, ensureCatalogItems,
  logHttpErrors, pickSelect, registerOwner, unique,
} from './support/helpers';

/**
 * Audit de las vistas de EMPRESA (tenant): busca formularios en fila (rejilla
 * multi-columna) en vez de en columna, botones de guardar bloqueados por
 * validez, y verifica el acompañamiento del orb en la primera vez de los
 * formularios principales + la bienvenida.
 *
 * Requiere el stack vivo (gateway :8080). Los catálogos se garantizan por API.
 */

/** Ningún contenedor con rejilla de 2+ columnas debe envolver campos de formulario. */
async function expectFormsInColumn(scope: Page | Locator) {
  const multiCol = scope.locator(
    '[class*="grid-cols-2"]:has(app-field), [class*="grid-cols-3"]:has(app-field), [class*="grid-cols-4"]:has(app-field)',
  );
  expect(await multiCol.count(), 'formularios deben apilarse en una columna, no en fila').toBe(0);
}

/** El botón de guardar/enviar del scope no debe estar deshabilitado por validez. */
async function expectSubmitNotBlocked(scope: Page | Locator, name: RegExp) {
  await expect(scope.getByRole('button', { name })).toBeEnabled();
}

test.describe('Audit de formularios de empresa', () => {
  test('bienvenida + acompañante + una columna + sin bloqueo', async ({ page, request }) => {
    test.setTimeout(240_000);
    logHttpErrors(page);

    const admin = await apiLogin(request, ADMIN.user, ADMIN.pass);
    await ensureCatalogItems(request, admin.token, 'business_type', [
      { code: 'BARBERSHOP', name: 'Barbería' }, { code: 'SALON', name: 'Salón de belleza' },
    ]);
    await ensureCatalogItems(request, admin.token, 'branch_type', [
      { code: 'MAIN', name: 'Principal' }, { code: 'BRANCH', name: 'Sucursal' },
    ]);

    // 1. Registro → dashboard con modal de bienvenida (orb + mensaje).
    const owner = await registerOwner(page);
    await page.goto('/tenant/dashboard');
    const welcome = page.locator('app-modal:has-text("bienvenida")');
    await expect(welcome.locator('app-mascot canvas')).toBeVisible();       // el orb saluda
    await expect(welcome.getByText(/Buenos días|Buenas tardes|Buenas noches/)).toBeVisible();
    await welcome.getByRole('button', { name: /Llenar más tarde/ }).click();

    // 2. Onboarding (wizard 2 pasos): acompañante + una columna + botón habilitado.
    await page.goto('/tenant/onboarding');
    await expect(page.locator('app-form-companion')).toBeVisible();
    await expectFormsInColumn(page.locator('form'));
    await expectSubmitNotBlocked(page, /Continuar/);

    // Provisiona el negocio (Paso 1: Negocio → Paso 2: Tus datos).
    await pickSelect(page, page, 0);                       // Tipo de negocio
    const bizTexts = page.locator('form input[type="text"]');
    await bizTexts.nth(0).fill(`Negocio ${owner.username}`);
    await bizTexts.nth(1).fill(unique('neg'));
    await page.locator('form').getByRole('button', { name: 'Continuar' }).click();
    await pickSelect(page, page, 0);                       // Tu tipo de documento
    await page.locator('form input[type="text"]').first().fill(unique('9')); // número de documento
    await page.locator('form').getByRole('button', { name: 'Crear mi negocio' }).click();
    await page.waitForURL('**/tenant/dashboard**', { timeout: 20_000 });

    // 3. Sedes: acompañante de primera vez + drawer en columna + guardar sin bloqueo.
    await page.goto('/tenant/sedes');
    await expect(page.locator('app-form-companion')).toBeVisible();          // aún no hay sedes
    await page.getByRole('button', { name: 'Nueva sede' }).click();
    const sedeDrawer = drawer(page);
    await expect(sedeDrawer).toBeVisible();
    await expectFormsInColumn(sedeDrawer);
    await expectSubmitNotBlocked(sedeDrawer, /Guardar/);
    // El botón responde aunque el form esté vacío: muestra validación, no navega.
    await sedeDrawer.getByRole('button', { name: /Guardar/ }).click();
    await expect(sedeDrawer.getByText(/Selecciona el tipo de sede/)).toBeVisible();

    // 4. Servicios y empleados: acompañante de primera vez.
    await page.goto('/tenant/servicios');
    await expect(page.locator('app-form-companion')).toBeVisible();

    await page.goto('/tenant/empleados');
    // Empleados requiere una sede; si no hay, la vista guía a crearla (sin form-companion).
    const hasBranch = await page.getByRole('button', { name: 'Nuevo empleado' }).count();
    if (hasBranch) await expect(page.locator('app-form-companion')).toBeVisible();
  });
});
