import { expect, test, Page } from '@playwright/test';
import { apiGet, apiLogin, apiPost, ADMIN, ensureCatalogItems, unique } from './support/helpers';

const GATEWAY = process.env['E2E_GATEWAY'] ?? 'http://localhost:8080';

/**
 * Sede: la ubicación llega hasta el barrio (ahora obligatorio) y la sede
 * guarda de verdad. Cubre dos bugs reportados:
 *  - "el barrio no guarda" → se afirma el POST /business/branches = 200.
 *  - "los selects no se limpian con la X" → tras limpiar, el panel vuelve a
 *    pedir el dato (municipio) y el guardar queda bloqueado.
 */
test.describe('Sede: ubicación con barrio obligatorio', () => {
  test('crea sede con municipio + barrio y guarda; la X limpia el select', async ({ page, request }) => {
    test.setTimeout(180_000);

    const admin = await apiLogin(request, ADMIN.user, ADMIN.pass);
    await ensureCatalogItems(request, admin.token, 'business_type', [{ code: 'BARBERSHOP', name: 'Barbería' }]);
    await ensureCatalogItems(request, admin.token, 'branch_type', [{ code: 'MAIN', name: 'Principal' }]);
    await ensureCatalogItems(request, admin.token, 'document_type', [{ code: 'CC', name: 'Cédula' }]);

    // Dueño + negocio por API (rápido y determinista).
    const s = unique('sede');
    const reg = await request.post(`${GATEWAY}/auth/register-owner`, {
      data: { firstName: 'Sede', lastName: `E2E ${s}`, email: `${s}@e2e.local`, username: s, password: 'Password123!' },
    });
    expect(reg.ok(), `register ${reg.status()}`).toBeTruthy();
    const rb = await reg.json();
    const token = rb.data.tokens.accessToken as string;
    const userId = rb.data.user.id as string;
    const bt = (await apiGet(request, token, '/system/list/business_type/enabled'))[0].id;
    const dt = (await apiGet(request, token, '/system/list/document_type/enabled'))[0].id;
    await apiPost(request, token, '/business/provision', {
      businessTypeId: bt, name: `Negocio ${s}`, slug: unique('neg'),
      ownerDocumentTypeId: dt, ownerDocumentNumber: `7${Date.now()}`,
      ownerFirstName: 'Sede', ownerFirstLastName: `E2E ${s}`, ownerUserId: userId,
    });

    // Sesión en el navegador.
    await page.goto('/login');
    await page.evaluate(([a, r, u]) => {
      localStorage.setItem('erp.accessToken', a);
      localStorage.setItem('erp.refreshToken', r);
      localStorage.setItem('erp.user', u);
    }, [token, rb.data.tokens.refreshToken, JSON.stringify(rb.data.user)]);

    await page.goto('/tenant/sedes');
    await page.getByRole('button', { name: 'Nueva sede' }).click();
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).toBeVisible();

    // --- Tipo de sede (app-autocomplete con opciones estáticas) ---
    // OJO: el placeholder está tanto en <app-autocomplete> como en el <input>;
    // getByRole('textbox') apunta solo al input (evita strict-mode violation).
    const typeInput = drawer.getByRole('textbox', { name: 'Selecciona el tipo' });
    await typeInput.click();
    await drawer.locator('[role="option"]').first().dispatchEvent('mousedown');

    // --- Bug de la X: limpiar el tipo y verificar que quedó vacío ---
    await drawer.getByRole('button', { name: 'Limpiar' }).first().click();
    await expect(typeInput).toHaveValue('');
    // Re-seleccionar para continuar.
    await typeInput.click();
    await drawer.locator('[role="option"]').first().dispatchEvent('mousedown');

    await drawer.getByRole('textbox', { name: 'Sede centro' }).fill(`Sede ${s}`);

    // --- Municipio (búsqueda en ES) ---
    const muniInput = drawer.getByRole('textbox', { name: /Busca tu municipio/ });
    await muniInput.click();
    await muniInput.fill('med');
    await page.waitForResponse(r => r.url().includes('/locations/municipalities') && r.status() === 200);
    await drawer.locator('[role="option"]').filter({ hasText: /Medell/i }).first().dispatchEvent('mousedown');

    // --- Barrio (aparece tras elegir municipio; ahora obligatorio) ---
    const barrioInput = drawer.getByRole('textbox', { name: /Buscar barrio o vereda/ });
    await expect(barrioInput).toBeVisible();
    await barrioInput.click();
    await barrioInput.fill('pob');
    await page.waitForResponse(r => r.url().includes('/locations/neighborhoods') && r.status() === 200);
    await drawer.locator('[role="option"]').first().dispatchEvent('mousedown');

    // --- Guardar: se afirma por la respuesta HTTP del create ---
    const createResp = page.waitForResponse(
      r => r.url().includes('/business/branches') && r.request().method() === 'POST', { timeout: 30_000 },
    );
    await drawer.getByRole('button', { name: /Guardar|Save/ }).click();
    const resp = await createResp;
    const body = await resp.json().catch(() => ({}));
    expect(resp.status(), `crear sede → ${JSON.stringify(body).slice(0, 200)}`).toBe(200);
    expect(body?.success, `crear sede → ${JSON.stringify(body).slice(0, 200)}`).toBeTruthy();

    // La sede aparece en la lista (guardó de verdad, antes no lo hacía). La vista
    // es un grid de tarjetas (no tabla): el nombre es el encabezado de la card.
    await expect(page.getByRole('heading', { name: `Sede ${s}` })).toBeVisible({ timeout: 15_000 });

    // El barrio quedó persistido (se afirma por la API: la sede trae neighborhoodId).
    const branches = await apiGet(request, token, `/business/branches?businessId=${body.data.businessId}`);
    const saved = (branches as Array<{ name: string; neighborhoodId?: string }>).find(b => b.name === `Sede ${s}`);
    expect(saved?.neighborhoodId, 'la sede guardó con barrio').toBeTruthy();
  });
});
