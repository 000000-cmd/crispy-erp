import { expect, test } from '@playwright/test';
import { byPlaceholder, drawer, logHttpErrors, loginAdmin, pickSelect, unique } from './support/helpers';

/** Administración: CRUD real, pipeline CQRS (outbox→Kafka→ES), dark mode e idioma. */
test.describe('Administración del sistema', () => {

  test('constants: crear, editar y eliminar (CRUD completo)', async ({ page }) => {
    const code = unique('ZZE2E').toUpperCase();
    await loginAdmin(page);
    await page.goto('/admin/constants');

    // Crear
    await page.getByRole('button', { name: /Nueva constante|New constant/ }).click();
    const d = drawer(page);
    const texts = d.locator('form input[type="text"]');
    await texts.nth(0).fill(code);
    await texts.nth(1).fill('Constante E2E');
    await texts.nth(2).fill('42');
    await d.getByRole('button', { name: /Guardar|Save/ }).click();
    await expect(page.getByRole('cell', { name: code })).toBeVisible({ timeout: 15_000 });

    // Editar (cambia el valor)
    await page.getByRole('row', { name: new RegExp(code) }).getByTitle(/Editar|Edit/).click();
    await drawer(page).locator('form input[type="text"]').nth(2).fill('43');
    await drawer(page).getByRole('button', { name: /Guardar|Save/ }).click();
    await expect(page.getByRole('cell', { name: '43' })).toBeVisible({ timeout: 15_000 });

    // Eliminar (con confirmación del modal, no el título de la fila)
    await page.getByRole('row', { name: new RegExp(code) }).getByTitle(/Eliminar|Delete/).click();
    await page.locator('app-confirm-host').getByRole('button', { name: /Eliminar|Delete/ }).click();
    await expect(page.getByRole('cell', { name: code })).toHaveCount(0);
  });

  test('terceros: crear en BD y verlo llegar por el pipeline outbox→Kafka→ES', async ({ page }) => {
    test.setTimeout(240_000);
    logHttpErrors(page);
    const doc = unique('7');
    await loginAdmin(page);
    await page.goto('/admin/thirdparty');

    await page.getByRole('button', { name: /Nuevo/ }).click();
    const d = drawer(page);
    await pickSelect(page, d, 0); // Tipo de documento
    const texts = d.locator('form input[type="text"]');
    await texts.nth(0).fill(doc);          // número de documento
    await texts.nth(1).fill('Tercero');    // primer nombre
    await texts.nth(3).fill('E2E');        // primer apellido
    // El éxito del create se afirma por la SEÑAL DIRECTA (respuesta HTTP del
    // POST), no por el DOM: el toast expira (TTL 4s) y el <aside> del drawer
    // permanece en el árbol tras cerrarse (animación) → toBeHidden era flaky.
    const createResp = page.waitForResponse(
      r => r.url().includes('/thirdparty/third-parties') && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await d.getByRole('button', { name: /Guardar|Save/ }).click();
    const resp = await createResp;
    const body = await resp.json().catch(() => ({}));
    expect(resp.status(), `create tercero → ${JSON.stringify(body).slice(0, 200)}`).toBe(200);
    expect(body?.success, `create tercero body → ${JSON.stringify(body).slice(0, 200)}`).toBeTruthy();
    await page.keyboard.press('Escape'); // cierra el drawer si sigue abierto

    // La lista lee de ELASTIC: el documento llega vía outbox (eventual).
    // OJO: el buscador tiene debounce(300)+distinctUntilChanged → entre limpiar
    // y reescribir hay que dejar pasar el debounce o el mismo término se traga.
    const search = byPlaceholder(page, 'Buscar por nombre o documento…');
    await expect(async () => {
      await search.fill('');
      await page.waitForTimeout(400);
      await search.fill(doc);
      await expect(page.getByRole('cell', { name: doc })).toBeVisible({ timeout: 4_000 });
    }).toPass({ timeout: 90_000, intervals: [3_000] });
  });

  test('dark mode: alterna, aplica la clase y PERSISTE tras recargar', async ({ page }) => {
    await loginAdmin(page);
    const html = page.locator('html');
    const wasDark = await html.evaluate(el => el.classList.contains('dark'));

    await page.locator('button:has(.app-knob)').first().click();
    await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/);

    await page.reload();
    await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/);

    // Volver al estado original para no afectar otros specs.
    await page.locator('button:has(.app-knob)').first().click();
  });

  test('idioma: ES ⇄ EN cambia los textos y persiste', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/constants');
    const heading = page.locator('h1').first();
    const before = (await heading.textContent())?.trim();

    await page.getByRole('radio', { name: 'EN' }).click();
    await expect(heading).not.toHaveText(before ?? '');

    await page.reload();
    await expect(heading).not.toHaveText(before ?? '');

    await page.getByRole('radio', { name: 'ES' }).click();
    await expect(heading).toHaveText(before ?? '');
  });
});
