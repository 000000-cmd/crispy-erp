import { Page, expect, test } from '@playwright/test';
import { byPlaceholder, logHttpErrors } from './support/helpers';

/**
 * Liquidación de servicios y comisiones. Los saldos se leen del read model de
 * Elasticsearch; confirmar mueve dinero contra finance-service.
 *
 * NO se afirma una confirmación real: el devengado llega en 0 hasta que exista
 * el módulo de citas, así que no hay saldo que liquidar en un entorno limpio.
 * Se afirma lo que SÍ es estable: que la pantalla carga desde ES y que el
 * desglose por servicio está deshabilitado a la espera de citas.
 */
const OWNER = { user: 'bugmrk65khp', pass: 'Password123!' };

async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(OWNER.user);
  await byPlaceholder(page, '••••••••').fill(OWNER.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
}

test.describe('Liquidaciones', () => {
  test('carga los saldos desde Elasticsearch y muestra el resumen', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);

    // El listado se alimenta del read model: se afirma por HTTP, no por pintura.
    const [balances] = await Promise.all([
      page.waitForResponse(r => /search\/balances\/by-business/.test(r.url()) && r.ok()),
      page.goto('/tenant/liquidaciones'),
    ]);
    expect(balances.ok()).toBeTruthy();

    await expect(page.getByRole('heading', { name: 'Liquidación y Cierre' })).toBeVisible();
    await expect(page.getByText('Pendientes de liquidar')).toBeVisible();
    await expect(page.getByText('Saldo a abonar')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Listado de aprobación' })).toBeVisible();
  });

  test('el desglose por servicio queda deshabilitado hasta que exista citas', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await page.goto('/tenant/liquidaciones');
    await expect(page.getByRole('heading', { name: 'Listado de aprobación' })).toBeVisible();

    const detalles = page.getByRole('button', { name: 'Ver detalles' }).first();
    if (await detalles.count()) await expect(detalles).toBeDisabled();
  });

  test('el historial de liquidaciones se abre', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await page.goto('/tenant/liquidaciones');

    await Promise.all([
      page.waitForResponse(r => /finance\/settlements/.test(r.url()) && r.ok()),
      page.getByRole('button', { name: 'Historial', exact: true }).click(),
    ]);
    await expect(page.getByRole('heading', { name: 'Historial de liquidaciones' })).toBeVisible();
  });
});
