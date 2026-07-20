import { Page, expect, test } from '@playwright/test';
import { byPlaceholder, logHttpErrors } from './support/helpers';

/**
 * Fase B — Compensación: los tipos híbridos guardan salario base + % juntos, y
 * la simulación ofrece un mini-modal con el desglose precio×% por servicio.
 * Afirma el guardado por HTTP (no por toast), patrón del repo.
 */
const OWNER = { user: 'bugmrk65khp', pass: 'Password123!' };

async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(OWNER.user);
  await byPlaceholder(page, '••••••••').fill(OWNER.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
}

test.describe('Compensación: salario base + % y mini-modal por servicio (Fase B)', () => {
  test('empresa: guarda salario+% y el mini-modal desglosa por servicio', async ({ page }) => {
    test.setTimeout(90_000);
    logHttpErrors(page);

    await loginAsOwner(page);
    await page.goto('/tenant/compensaciones');

    // Pestaña Empresa (default). Elegir el tipo híbrido "Salario + % servicio".
    await page.getByRole('button', { name: 'Salario + % servicio' }).click();

    // Salario base (input money) + porcentaje (preset del slider del design system).
    await byPlaceholder(page, '0').first().fill('1200000');
    await page.getByRole('button', { name: '25%', exact: true }).click();

    // Guardar → afirmar por HTTP que salaryBase Y compensationValue viajan.
    const [saveRes] = await Promise.all([
      page.waitForResponse(r => /business-compensations/.test(r.url())
        && ['POST', 'PUT'].includes(r.request().method()) && r.ok()),
      page.getByRole('button', { name: /Guardar aquí|Actualizar/ }).click(),
    ]);
    // Afirmamos por el payload de la petición (fiable) + status ok: el front
    // envía salario base Y porcentaje juntos (el round-trip en BD ya está
    // cubierto por el smoke del backend).
    expect(saveRes.ok()).toBeTruthy();
    const sent = JSON.parse(saveRes.request().postData() || '{}');
    expect(Number(sent.salaryBase)).toBe(1200000);
    expect(Number(sent.compensationValue)).toBe(25);

    // Simulación: abre el mini-modal con el desglose por servicio.
    await page.getByRole('button', { name: 'Simular con servicios' }).click();
    await expect(page.getByText('Est. servicios / mes')).toBeVisible();
  });
});
