import { expect, test } from '@playwright/test';
import { byPlaceholder, drawer, expectToast, loginAdmin } from './support/helpers';

/**
 * Distribución del APK (admin): validaciones de subida, histórico y borrado.
 * Se sube SIN publicar para no mover VERAPP ni la vigente del entorno, con una
 * versión única por corrida (el histórico es UNIQUE por Version/VersionCode).
 */
test.describe('Versiones del APK', () => {

  test('subir al histórico (sin publicar), validar y eliminar', async ({ page }) => {
    const now = Date.now();
    const version = `999.0.${now % 1000}`;
    const versionCode = String(Math.floor(now / 1000)); // epoch-seconds: entero creciente
    const versionRe = new RegExp(version.replace(/\./g, '\\.'));

    await loginAdmin(page);
    await page.goto('/admin/app-versions');
    await expect(page.getByRole('button', { name: /Copiar link de descarga|Copy download link/ })).toBeVisible();

    await page.getByRole('button', { name: /Subir versión|Upload version/ }).click();
    const d = drawer(page);
    const guardar = d.getByRole('button', { name: /Guardar|Save/ });
    await expect(guardar).toBeDisabled(); // sin archivo no hay subida

    // Archivo fake .apk: el back solo exige extensión y bytes (checksum real).
    await d.locator('input[type="file"]').setInputFiles({
      name: `saas-app-${version}.apk`,
      mimeType: 'application/vnd.android.package-archive',
      buffer: Buffer.from('PK-e2e-fake-apk-content'),
    });
    // La versión se sugiere desde el nombre del archivo.
    await expect(byPlaceholder(d, '1.0.1')).toHaveValue(version);
    await byPlaceholder(d, '2').fill(versionCode);
    // Apagar "Publicar al subir" → queda solo en el histórico.
    await d.locator('button.app-switch').click();
    await expect(guardar).toBeEnabled();
    await guardar.click();
    await expectToast(page, versionRe);

    const row = page.getByRole('row', { name: versionRe });
    await expect(row.getByText(/Histórica|Historic/)).toBeVisible();

    // Limpieza: eliminar del histórico (borrado FÍSICO: registro + binario).
    await row.getByTitle(/Eliminar|Delete/).click();
    await page.locator('app-confirm-host').getByRole('button', { name: /Eliminar|Delete/ }).click();
    await expectToast(page, /Versión eliminada|Version deleted/);
    await expect(page.getByRole('row', { name: versionRe })).toHaveCount(0);
  });
});
