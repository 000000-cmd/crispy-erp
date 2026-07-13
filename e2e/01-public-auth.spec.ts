import { expect, test } from '@playwright/test';
import { ADMIN, byPlaceholder } from './support/helpers';

/** Superficie pública y separación de accesos (dueño / admin / empleado). */
test.describe('Público y autenticación', () => {

  test('landing renderiza y sus CTAs solo llevan a login/registro', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    await expect(page.locator('a[href="/login/register"]').first()).toBeVisible();
    // El acceso admin NO se expone en la landing.
    await expect(page.locator('a[href*="/admin"]')).toHaveCount(0);
  });

  test('guards: /admin y /tenant sin sesión redirigen a login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/tenant/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login con credenciales inválidas muestra error y no navega', async ({ page }) => {
    await page.goto('/login');
    await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill('nadie@e2e.local');
    await byPlaceholder(page, '••••••••').fill('malaclave123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('un admin NO entra por el login común (ruta dedicada)', async ({ page }) => {
    await page.goto('/login');
    await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(ADMIN.user);
    await byPlaceholder(page, '••••••••').fill(ADMIN.pass);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Los administradores ingresan por su acceso dedicado.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('el admin entra por /login/admin y ve el sidebar configurado por rol', async ({ page }) => {
    await page.goto('/login/admin');
    await byPlaceholder(page, 'admin  /  admin@sistema.com').fill(ADMIN.user);
    await byPlaceholder(page, '••••••••').fill(ADMIN.pass);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.waitForURL('**/admin/**');
    // Menús que vienen de la config en BD (menus/me), no de un nav estático.
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Terceros' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Versiones del APK' })).toBeVisible();
  });
});
