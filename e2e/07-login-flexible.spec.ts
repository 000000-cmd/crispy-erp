import { expect, test } from '@playwright/test';
import {
  ADMIN, apiGet, apiLogin, apiPost, byPlaceholder, ensureCatalogItems,
  logHttpErrors, registerOwner, unique,
} from './support/helpers';

const GATEWAY = process.env['E2E_GATEWAY'] ?? 'http://localhost:8080';

/**
 * Login flexible: la misma cuenta entra con usuario, correo o número de
 * documento (el documento se resuelve auth → thirdparty vía S2S).
 * Antes de probarlo, el spec valida que TODO el stack esté en línea.
 */
test.describe('Login flexible (usuario / correo / documento)', () => {

  test('el stack está en línea (gateway, auth, system, front)', async ({ page, request }) => {
    // Gateway arriba.
    const health = await request.get(`${GATEWAY}/actuator/health`);
    expect(health.ok(), `gateway health ${health.status()}`).toBeTruthy();

    // Auth responde (credenciales basura → rechazo controlado, no un 5xx).
    const bad = await request.post(`${GATEWAY}/auth/login`, {
      data: { usernameOrEmail: 'nadie@e2e.local', password: 'incorrecta1!' },
    });
    expect([400, 401]).toContain(bad.status());

    // System responde por su ruta pública (200 aunque no haya versión publicada).
    const versions = await request.get(`${GATEWAY}/system/public/app-versions/latest`);
    expect(versions.ok(), `system public ${versions.status()}`).toBeTruthy();

    // El front carga su página pública.
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('registro → negocio con documento → entra por usuario Y por documento', async ({ page, request }) => {
    test.setTimeout(240_000);
    logHttpErrors(page);

    // ---------- 0. Catálogos mínimos (business_type / document_type) ----------
    const admin = await apiLogin(request, ADMIN.user, ADMIN.pass);
    await ensureCatalogItems(request, admin.token, 'business_type', [
      { code: 'BARBERSHOP', name: 'Barbería' },
    ]);
    await ensureCatalogItems(request, admin.token, 'document_type', [
      { code: 'CC', name: 'Cédula de ciudadanía' },
    ]);

    // ---------- 1. Dueño nuevo + negocio con SU documento (por API) ----------
    const owner = await registerOwner(page);
    // OJO: debe ser 100% numérico (el back solo trata como documento los
    // identificadores \d{5,20}); unique() genera base36 y NO sirve aquí.
    const documento = `7${Date.now()}`;
    const { token, userId } = await apiLogin(request, owner.email, owner.password);
    const bizTypes = await apiGet(request, token, '/system/list/business_type/enabled');
    const docTypes = await apiGet(request, token, '/system/list/document_type/enabled');
    await apiPost(request, token, '/business/provision', {
      businessTypeId: bizTypes[0].id,
      name: `Negocio ${owner.username}`,
      slug: unique('neg'),
      ownerDocumentTypeId: docTypes[0].id,
      ownerDocumentNumber: documento,
      ownerFirstName: owner.firstName,
      ownerFirstLastName: owner.lastName,
      ownerUserId: userId,
    });

    // ---------- 2. Entra con USUARIO ----------
    await loginAs(page, owner.username, owner.password);
    await expect(page).toHaveURL(/\/tenant\//, { timeout: 20_000 });

    // ---------- 3. Entra con NÚMERO DE DOCUMENTO ----------
    await loginAs(page, documento, owner.password);
    await expect(page).toHaveURL(/\/tenant\//, { timeout: 20_000 });

    // ---------- 4. El documento con contraseña equivocada NO entra ----------
    const rejected = await request.post(`${GATEWAY}/auth/login`, {
      data: { usernameOrEmail: documento, password: 'Incorrecta123!' },
    });
    expect([400, 401]).toContain(rejected.status());
  });
});

/** Cierra la sesión (storage) y entra por la UI con el identificador dado. */
async function loginAs(page: import('@playwright/test').Page, identifier: string, password: string) {
  await page.evaluate(() => {
    localStorage.removeItem('erp.accessToken');
    localStorage.removeItem('erp.refreshToken');
    localStorage.removeItem('erp.user');
  });
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(identifier);
  await byPlaceholder(page, '••••••••').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}
