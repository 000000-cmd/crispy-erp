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

    // Gate: un dueño sin negocio que intenta una ruta operativa es enviado a crearlo.
    await page.goto('/tenant/dashboard');
    await expect(page).toHaveURL(/\/tenant\/onboarding/);

    // ---------- 2. Onboarding del negocio (wizard 2 pasos: Negocio → Tus datos) ----------
    await page.goto('/tenant/onboarding');
    // Paso 1: Negocio (tipo, nombre, subdominio).
    await pickSelect(page, page, 0);                    // Tipo de negocio
    const bizTexts = page.locator('form input[type="text"]');
    await bizTexts.nth(0).fill(`Negocio ${owner.username}`);
    await bizTexts.nth(1).fill(unique('neg'));          // slug único
    await page.locator('form').getByRole('button', { name: 'Continuar' }).click();
    // Paso 2: Tus datos (nombre/apellido pre-rellenados desde la cuenta).
    await pickSelect(page, page, 0);                    // Tu tipo de documento
    await page.locator('form input[type="text"]').first().fill(unique('9')); // número de documento
    // OJO: el sidebar del dueño también tiene un ítem "Crear mi negocio" → scope al form.
    await page.locator('form').getByRole('button', { name: 'Crear mi negocio' }).click();
    await expectToast(page, '¡Negocio creado correctamente!');
    await page.waitForURL('**/tenant/dashboard');
    await expect(page.getByText(`Negocio ${owner.username}`).first()).toBeVisible();
    // Primer ingreso: aparece el modal de bienvenida con los pasos mínimos.
    await expect(page.getByText('Te damos la bienvenida')).toBeVisible();
    await page.getByRole('button', { name: 'Llenar más tarde' }).click();
    // Ya en el dashboard: el widget de completitud (header único) pide los pasos que faltan.
    await expect(page.getByText('Termina de configurar tu negocio')).toBeVisible();

    // Gate inverso: con el negocio ya creado, el onboarding deja de ser una opción.
    await page.goto('/tenant/onboarding');
    await expect(page).toHaveURL(/\/tenant\/dashboard/);

    // ---------- 3. Servicio vía UI (drawer + cards) ----------
    await page.goto('/tenant/servicios');
    await page.getByRole('button', { name: 'Nuevo servicio' }).click();
    const d1 = drawer(page);
    await d1.locator('form input[type="text"]').first().fill('Corte E2E');
    await d1.locator('form input[type="number"]').first().fill('30'); // duración
    await d1.locator('form input[inputmode="numeric"]').fill('25000'); // precio (money con máscara)
    await d1.getByRole('button', { name: /Guardar|Save/ }).click();
    await expectToast(page, 'Servicio guardado');
    // La vista es una carta de precios (cards), no tabla: nombre + precio enmascarado.
    await expect(page.getByRole('heading', { name: 'Corte E2E' })).toBeVisible();
    await expect(page.getByText(/\$\s?25\.000/)).toBeVisible();

    // ---------- 4. Sede: validación UI + creación por API ----------
    await page.goto('/tenant/sedes');
    await page.getByRole('button', { name: 'Nueva sede' }).click();
    const d2 = drawer(page);
    const guardarSede = d2.getByRole('button', { name: /Guardar|Save/ });
    // El botón ya NO se bloquea: al intentar guardar vacío, muestra la validación y no cierra.
    await expect(guardarSede).toBeEnabled();
    await guardarSede.click();
    await expect(d2.getByText(/Selecciona el tipo de sede/)).toBeVisible();
    await expect(d2).toBeVisible();                       // sigue abierto, no guardó
    await byPlaceholder(d2, 'Sede centro').fill('Sede E2E');
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

    // ---------- 5. Empleado: ALTA MÍNIMA (solo cuenta) vía UI ----------
    // El tercero y el registro laboral nacen como shells; el empleado completa
    // sus datos desde el APK. En la lista aparece "Pendiente de completar".
    const emp = unique('emp');
    await page.goto('/tenant/empleados');
    await page.getByRole('button', { name: 'Nuevo empleado' }).click();
    const d3 = drawer(page);
    await d3.locator('form input[type="text"]').first().fill(emp);           // usuario
    await d3.locator('form input[type="email"]').fill(`${emp}@e2e.local`);   // correo
    await d3.locator('form input[type="password"]').fill('Password123!');    // contraseña
    await d3.getByRole('button', { name: /Guardar|Save/ }).click();
    await expectToast(page, /Empleado creado/);
    await expect(page.getByRole('cell', { name: 'Pendiente de completar' })).toBeVisible();

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
    await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(`${emp}@e2e.local`);
    await byPlaceholder(page, '••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Las cuentas de empleado ingresan por la app móvil.')).toBeVisible();
  });
});
