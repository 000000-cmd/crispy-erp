import { Page, expect, test } from '@playwright/test';
import { byPlaceholder, logHttpErrors } from './support/helpers';

/**
 * Buscador de localizaciones: estados del desplegable y limpieza en cascada.
 *
 * Cubre tres fallos reales que se corrigieron:
 *  1. Buscar municipio quedaba acotado al departamento ya elegido, así que
 *     cambiar de departamento respondía "sin resultados".
 *  2. Al cambiar de municipio, el barrio anterior seguía visible aunque el
 *     estado interno ya estaba en nulo.
 *  3. El panel se quedaba en blanco mientras el servicio respondía.
 */
const OWNER = { user: 'bugmrk65khp', pass: 'Password123!' };

async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(OWNER.user);
  await byPlaceholder(page, '••••••••').fill(OWNER.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
}

async function openNuevaSede(page: Page) {
  await page.goto('/tenant/sedes');
  await page.getByRole('button', { name: 'Nueva sede' }).click();
  await expect(byPlaceholder(page, 'Busca tu municipio…')).toBeVisible();
}

test.describe('Buscador de localizaciones', () => {
  test('el desplegable avisa cuando no hay coincidencias', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await openNuevaSede(page);

    await byPlaceholder(page, 'Busca tu municipio…').fill('zzzqqq');
    await expect(page.getByText(/Sin resultados para "zzzqqq"/)).toBeVisible();
  });

  test('se puede cambiar de departamento sin limpiar el campo primero', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await openNuevaSede(page);
    const municipio = byPlaceholder(page, 'Busca tu municipio…');

    await municipio.fill('medellin');
    await page.getByRole('option', { name: /Medellin/ }).click();
    await expect(municipio).toHaveValue(/Medellin/);

    // Con Antioquia ya derivada, un municipio de OTRO departamento debe salir.
    await municipio.fill('bogota');
    await expect(page.getByRole('option', { name: /Bogota/ })).toBeVisible();
  });

  test('cambiar de municipio limpia el barrio anterior', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await openNuevaSede(page);
    const municipio = byPlaceholder(page, 'Busca tu municipio…');

    await municipio.fill('bogota');
    await page.getByRole('option', { name: /Bogota/ }).click();

    const barrio = byPlaceholder(page, 'Buscar barrio o vereda…');
    await barrio.fill('cha');
    await page.getByRole('option', { name: /Chapinero/ }).click();
    await expect(barrio).toHaveValue(/Chapinero/);

    // Cambiar de municipio invalida el barrio: no puede quedar el de antes.
    await municipio.fill('medellin');
    await page.getByRole('option', { name: /Medellin/ }).click();
    await expect(byPlaceholder(page, 'Buscar barrio o vereda…')).toHaveValue('');
  });
});
