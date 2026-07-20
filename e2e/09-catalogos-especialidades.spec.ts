import { Page, expect, test } from '@playwright/test';
import { byPlaceholder, drawer, logHttpErrors, pickSelect, unique } from './support/helpers';

/**
 * Dueño de prueba ya provisionado (negocio + sede) en la BD dev, reutilizado
 * por este spec para no repetir el flujo completo de registro/onboarding
 * (ver 03-owner-operation.spec.ts para ese ciclo).
 */
const OWNER = { user: 'bugmrk65khp', pass: 'Password123!' };

/** Login por la UI con el mismo patrón que 07-login-flexible.spec.ts. */
async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(OWNER.user);
  await byPlaceholder(page, '••••••••').fill(OWNER.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
}

test.describe('Catálogos: categorías y especialidades (Fase A)', () => {
  test('crea una especialidad desde el gestor y la asigna a un servicio nuevo', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await page.goto('/tenant/servicios');

    // ---------- 1. Abre el gestor de catálogos y crea una especialidad ----------
    await page.getByRole('button', { name: 'Gestionar catálogos' }).click();
    const specialtyName = unique('Colorimetria');
    await byPlaceholder(page, 'Nueva especialidad').fill(specialtyName);
    const [specRes] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/specialties') && r.request().method() === 'POST' && r.ok()),
      page.getByRole('button', { name: 'Añadir especialidad' }).click(),
    ]);
    expect(specRes.ok()).toBeTruthy();
    const createdSpecialty = (await specRes.json()).data;
    expect(createdSpecialty?.id).toBeTruthy();
    await expect(page.getByText(specialtyName)).toBeVisible();

    // Cierra el gestor por la X del modal (el modal no responde a ESC, a
    // diferencia del drawer). Se hace scope a `.app-modal` porque el drawer
    // de servicios también tiene un botón "Cerrar" siempre presente en el DOM.
    await page.locator('.app-modal').getByRole('button', { name: 'Cerrar' }).click();

    // ---------- 2. Crea un servicio y le asigna esa especialidad ----------
    await page.getByRole('button', { name: 'Nuevo servicio' }).click();
    const d = drawer(page);
    const serviceName = unique('Mechas E2E ');
    await d.locator('form input[type="text"]').first().fill(serviceName);   // Nombre
    await d.locator('form input[type="number"]').first().fill('90');        // Duración (min)
    await d.locator('form input[inputmode="numeric"]').fill('120000');      // Precio (máscara)

    // Selects del schema en orden: Categoría (0), Especialidad (1).
    await pickSelect(page, d, 1, specialtyName);

    const [offRes] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/offerings') && r.request().method() === 'POST' && r.ok()),
      d.getByRole('button', { name: /Guardar|Save/ }).click(),
    ]);
    // Se afirma por el PAYLOAD de la petición, no por el cuerpo de la respuesta:
    // Playwright puede desalojar el body bajo la carga de la suite completa
    // (pasaba aislado y fallaba en conjunto). El round-trip de specialtyId en BD
    // ya está cubierto por el smoke del backend.
    const sent = JSON.parse(offRes.request().postData() || '{}');
    expect(sent.specialtyId).toBe(createdSpecialty.id);
    await expect(page.getByRole('heading', { name: serviceName })).toBeVisible();
  });
});
