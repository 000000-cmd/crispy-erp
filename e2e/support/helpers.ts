import { APIRequestContext, Locator, Page, expect } from '@playwright/test';

export const GATEWAY = 'http://localhost:8080';
export const ADMIN = { user: 'admin', pass: 'Admin123!' };

/** Sufijo único por corrida para no chocar con datos previos (BD dev compartida). */
export const runId = Date.now().toString(36).slice(-6);

export function unique(prefix: string): string {
  return `${prefix}${runId}${Math.floor(Math.random() * 1000)}`;
}

// ---------------- UI ----------------

/**
 * El input REAL por placeholder. `app-input` replica el atributo en su host,
 * así que getByPlaceholder daría 2 matches (strict violation).
 */
export function byPlaceholder(scope: Page | Locator, placeholder: string): Locator {
  return scope.locator(`input[placeholder="${placeholder}"]`);
}

/** El drawer se portalea a <body>; este es su panel. */
export function drawer(page: Page): Locator {
  return page.locator('aside[role="dialog"]');
}

export async function loginAdmin(page: Page): Promise<void> {
  await page.goto('/login/admin');
  await byPlaceholder(page, 'admin  /  admin@sistema.com').fill(ADMIN.user);
  await byPlaceholder(page, '••••••••').fill(ADMIN.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/admin/**');
}

/**
 * Wizard público de registro de dueño (MÍNIMO, solo cuenta). Devuelve las
 * credenciales creadas. Los datos del negocio ya NO se piden aquí: se completan
 * en el onboarding / widget del dashboard.
 */
export async function registerOwner(page: Page) {
  const suffix = unique('e2e');
  const creds = {
    firstName: 'Owner',
    lastName: `Prueba ${suffix}`,
    email: `${suffix}@e2e.local`,
    username: suffix,
    password: 'Password123!',
  };
  await page.goto('/login/register');
  // Paso 1 (Cuenta): nombre, apellido, correo, usuario, contraseña (una columna).
  const inputs = page.locator('input');
  await inputs.nth(0).fill(creds.firstName);   // Nombre
  await inputs.nth(1).fill(creds.lastName);    // Apellido
  await byPlaceholder(page, 'tu@correo.com').fill(creds.email);
  await inputs.nth(3).fill(creds.username);    // Usuario
  await byPlaceholder(page, 'Mínimo 8 caracteres').fill(creds.password);
  await page.getByRole('button', { name: 'Continuar' }).click();
  // Paso 2 (Confirmar) → crear (el stepper anima ~650ms; el getByRole auto-espera).
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
  return creds;
}

/**
 * Abre el select N (dynamic-form) dentro del scope y elige una opción del
 * PANEL ABIERTO (los cerrados quedan en el DOM con opacity-0).
 */
export async function pickSelect(page: Page, scope: Page | Locator, index: number, optionName?: string | RegExp) {
  const triggers = scope.locator('div.relative:has(> div[role="listbox"]) > button');
  await triggers.nth(index).click();
  const openPanel = page.locator('.app-dropdown.is-open');
  const option = optionName
    ? openPanel.getByRole('option', { name: optionName }).first()
    : openPanel.getByRole('option').first();
  await option.click();
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 15_000 });
}

/** Loguea respuestas HTTP fallidas del back en el output del test. */
export function logHttpErrors(page: Page) {
  page.on('response', res => {
    if (res.status() >= 400) {
      // eslint-disable-next-line no-console
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    }
  });
}

// ---------------- API (para preparar datos sin depender de la UI) ----------------

export async function apiLogin(
  request: APIRequestContext,
  usernameOrEmail: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const res = await request.post(`${GATEWAY}/auth/login`, {
    data: { usernameOrEmail, email: usernameOrEmail, password },
  });
  expect(res.ok(), `login API ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return { token: body.data.tokens.accessToken as string, userId: body.data.user.id as string };
}

export async function apiGet(request: APIRequestContext, token: string, path: string) {
  const res = await request.get(`${GATEWAY}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  expect(res.ok(), `GET ${path} -> ${res.status()}`).toBeTruthy();
  return (await res.json()).data;
}

/**
 * Garantiza items en un catálogo (vía admin). Cubre entornos cuya BD se migró
 * antes de que el seed trajera items de business_type/branch_type.
 */
export async function ensureCatalogItems(
  request: APIRequestContext,
  adminToken: string,
  catalog: string,
  items: Array<{ code: string; name: string }>,
) {
  const existing = await apiGet(request, adminToken, `/system/list/${catalog}/enabled`);
  if (Array.isArray(existing) && existing.length > 0) return;
  for (const [i, it] of items.entries()) {
    await apiPost(request, adminToken, `/system/list/${catalog}`, { ...it, displayOrder: i + 1 });
  }
}

export async function apiPost(request: APIRequestContext, token: string, path: string, data: unknown) {
  const res = await request.post(`${GATEWAY}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  expect(res.ok(), `POST ${path} -> ${res.status()}: ${await res.text()}`).toBeTruthy();
  return (await res.json()).data;
}
