import { expect, test } from '@playwright/test';
import {
  ADMIN, apiGet, apiLogin, apiPost, byPlaceholder, drawer, ensureCatalogItems,
  expectToast, logHttpErrors, pickSelect, registerOwner, unique,
} from './support/helpers';

/**
 * Ciclo completo del dueño: registro → onboarding del negocio → servicio →
 * sede → empleado (cuenta+persona+laboral) → conteos reales del dashboard →
 * el empleado NO entra a la web (usa el APK).
 *
 * La sede se crea por API (la búsqueda de municipio depende del índice ES de
 * locations); la UI de sedes valida el formulario y lista el resultado.
 */
test.describe('Operación del dueño (ciclo completo)', () => {
  test('registro → negocio → servicio → sede → empleado → conteos', async ({ page, request }) => {
    test.setTimeout(240_000);
    logHttpErrors(page);

    // ---------- 0. Precondición: catálogos con items (hallazgo E2E: el seed
    // original no traía business_type/branch_type y el onboarding quedaba
    // bloqueado con selects vacíos). ----------
    const admin = await apiLogin(request, ADMIN.user, ADMIN.pass);
    await ensureCatalogItems(request, admin.token, 'business_type', [
      { code: 'BARBERSHOP', name: 'Barbería' },
      { code: 'SALON', name: 'Salón de belleza' },
    ]);
    await ensureCatalogItems(request, admin.token, 'branch_type', [
      { code: 'MAIN', name: 'Principal' },
      { code: 'BRANCH', name: 'Sucursal' },
    ]);

    // ---------- 1. Registro del dueño ----------
    const owner = await registerOwner(page);

    // ---------- 2. Onboarding del negocio (formulario en página, sin drawer) ----------
    await page.goto('/tenant/onboarding');
    await pickSelect(page, page, 0);                    // Tipo de negocio
    const texts = page.locator('form input[type="text"]');
    await texts.nth(0).fill(`Negocio ${owner.username}`);
    await texts.nth(1).fill(unique('neg'));             // slug único
    await pickSelect(page, page, 1);                    // Tu tipo de documento
    await texts.nth(2).fill(unique('9'));               // número de documento
    await texts.nth(3).fill('Owner');
    await texts.nth(4).fill('Operativo');
    // OJO: el sidebar del dueño también tiene un ítem "Crear mi negocio" → scope al form.
    await page.locator('form').getByRole('button', { name: 'Crear mi negocio' }).click();
    await expectToast(page, '¡Negocio creado correctamente!');
    await page.waitForURL('**/tenant/dashboard');
    await expect(page.getByText(`Negocio ${owner.username}`).first()).toBeVisible();
    await expect(page.getByText('Siguiente paso: crea tu primera sede')).toBeVisible();

    // ---------- 3. Servicio vía UI (drawer) ----------
    await page.goto('/tenant/servicios');
    await page.getByRole('button', { name: 'Nuevo servicio' }).click();
    const d1 = drawer(page);
    await d1.locator('form input[type="text"]').first().fill('Corte E2E');
    const numbers = d1.locator('form input[type="number"]');
    await numbers.nth(0).fill('30');
    await numbers.nth(1).fill('25000');
    await d1.getByRole('button', { name: /Guardar|Save/ }).click();
    await expectToast(page, 'Servicio guardado');
    await expect(page.getByRole('cell', { name: 'Corte E2E' })).toBeVisible();

    // ---------- 4. Sede: validación UI + creación por API ----------
    await page.goto('/tenant/sedes');
    await page.getByRole('button', { name: 'Nueva sede' }).click();
    const d2 = drawer(page);
    const guardarSede = d2.getByRole('button', { name: /Guardar|Save/ });
    await expect(guardarSede).toBeDisabled(); // sin tipo+nombre+municipio no se puede
    await byPlaceholder(d2, 'Sede centro').fill('Sede E2E');
    await expect(guardarSede).toBeDisabled(); // sigue faltando tipo y municipio
    await page.keyboard.press('Escape'); // cierra (se re-navega igual abajo)

    const { token, userId } = await apiLogin(request, owner.email, owner.password);
    const businesses = await apiGet(request, token, `/business/mine?userId=${userId}`);
    expect(businesses.length, 'el dueño debe tener su negocio').toBeGreaterThan(0);
    const businessId = businesses[0].id;
    const branchTypes = await apiGet(request, token, '/system/list/branch_type/enabled');
    const municipalities = await apiGet(request, token, '/system/location/municipalities');
    expect(municipalities.length, 'V2 debe sembrar municipios').toBeGreaterThan(0);
    await apiPost(request, token, '/business/branches', {
      businessId,
      branchTypeId: branchTypes[0].id,
      name: 'Sede E2E',
      municipalityId: municipalities[0].id,
      isMain: true,
    });
    await page.goto('/tenant/sedes');
    await expect(page.getByRole('cell', { name: 'Sede E2E' })).toBeVisible();

    // ---------- 5. Empleado (cuenta EMPLOYEE + persona + laboral) vía UI ----------
    const emp = unique('emp');
    await page.goto('/tenant/empleados');
    await page.getByRole('button', { name: 'Nuevo empleado' }).click();
    const d3 = drawer(page);
    await pickSelect(page, d3, 0); // Cargo
    await d3.locator('form input[type="date"]').first().fill('2026-07-01');
    await pickSelect(page, d3, 1); // Tipo de documento
    const t = d3.locator('form input[type="text"]');
    await t.nth(1).fill(unique('8'));      // número de documento (texto 0 = código interno)
    await t.nth(2).fill('Empleado');       // primer nombre
    await t.nth(4).fill('Prueba');         // primer apellido
    await d3.locator('form input[type="email"]').fill(`${emp}@e2e.local`);
    await t.nth(6).fill(emp);              // usuario
    await d3.locator('form input[type="password"]').fill('Password123!');
    await d3.getByRole('button', { name: /Guardar|Save/ }).click();
    await expectToast(page, /Empleado creado/);
    await expect(page.getByRole('cell', { name: 'Empleado Prueba' })).toBeVisible();

    // ---------- 6. Dashboard con conteos REALES ----------
    await page.goto('/tenant/dashboard');
    const kpi = (label: string) =>
      page.locator('button', { hasText: label }).locator('p.text-3xl');
    await expect(kpi('Sedes')).toHaveText('1');
    await expect(kpi('Empleados')).toHaveText('1');
    await expect(kpi('Servicios')).toHaveText('1');
    await expect(page.getByText('App móvil para tu equipo')).toBeVisible();

    // ---------- 7. El empleado NO entra a la web ----------
    // Cerrar la sesión del dueño: con sesión activa /login redirige al home.
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await byPlaceholder(page, 'usuario  /  tu@empresa.com').fill(`${emp}@e2e.local`);
    await byPlaceholder(page, '••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Las cuentas de empleado ingresan por la app móvil.')).toBeVisible();
  });
});
