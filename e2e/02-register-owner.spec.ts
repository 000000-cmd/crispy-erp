import { expect, test } from '@playwright/test';
import { byPlaceholder, registerOwner, unique } from './support/helpers';

/** Wizard público de alta de dueño: validaciones por paso, happy path y duplicados. */
test.describe('Registro de dueño', () => {

  test('paso 1 (cuenta): Continuar se habilita solo con los datos válidos', async ({ page }) => {
    await page.goto('/login/register');
    const continuar = page.getByRole('button', { name: 'Continuar' });
    await expect(continuar).toBeDisabled();

    const inputs = page.locator('input');
    await inputs.nth(0).fill('Ana');                                   // Nombre
    await inputs.nth(1).fill('Pérez');                                 // Apellido
    await byPlaceholder(page, 'tu@correo.com').fill('ana@correo.com');
    await inputs.nth(3).fill('anaperez');                             // Usuario
    // Contraseña corta: sigue deshabilitado.
    await byPlaceholder(page, 'Mínimo 8 caracteres').fill('123');
    await expect(continuar).toBeDisabled();
    await byPlaceholder(page, 'Mínimo 8 caracteres').fill('Password123!');
    await expect(continuar).toBeEnabled();
  });

  test('happy path: registro (solo cuenta) aterriza en /tenant', async ({ page }) => {
    await registerOwner(page);
    // Sin negocio aún: el panel invita a crearlo.
    await expect(page.getByText('Empieza por registrar tu negocio')).toBeVisible();
  });

  test('caso borde: username duplicado muestra el error del back y no navega', async ({ page }) => {
    const creds = await registerOwner(page);

    // Cerrar la sesión recién creada: con sesión activa el router (bien) no
    // deja volver al registro.
    await page.evaluate(() => localStorage.clear());

    // Segundo registro con el MISMO username (correo distinto).
    await page.goto('/login/register');
    const inputs = page.locator('input');
    await inputs.nth(0).fill('Otro');
    await inputs.nth(1).fill('Dueño');
    await byPlaceholder(page, 'tu@correo.com').fill(`${unique('otro')}@e2e.local`);
    await inputs.nth(3).fill(creds.username); // duplicado
    await byPlaceholder(page, 'Mínimo 8 caracteres').fill('Password123!');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    // Se queda en el wizard con un error visible (mensaje del back).
    await expect(page.locator('p.text-rose-600')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/login\/register/);
  });
});
