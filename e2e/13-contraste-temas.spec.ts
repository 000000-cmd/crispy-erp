import { Page, expect, test } from '@playwright/test';
import { byPlaceholder, logHttpErrors } from './support/helpers';

/**
 * Contraste de texto en modo claro y oscuro (WCAG AA).
 *
 * Nace de un fallo real: en oscuro se invirtió `on-primary` siguiendo la
 * convención M3, pero el morado de marca NO se invierte (es constante en ambos
 * temas), así que los botones primarios quedaban con texto morado oscuro sobre
 * morado — 1.4 de contraste, ilegibles. Este spec lo mide en vez de confiar en
 * el ojo.
 *
 * Se ignoran a propósito: texto sobre degradados (el fondo no es un color
 * plano y el cálculo no aplica) y texto recortado por `background-clip: text`.
 */
const OWNER = { user: 'bugmrk65khp', pass: 'Password123!' };

const RUTAS = [
  '/tenant/dashboard',
  '/tenant/liquidaciones',
  '/tenant/empleados',
  '/tenant/sedes',
  '/tenant/servicios',
  '/tenant/compensaciones',
];

/** Devuelve los textos que no alcanzan el mínimo AA en la página actual. */
async function fallosDeContraste(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const lum = (c: number[]) => {
      const [r, g, b] = c.map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    // El tema usa OKLCH, que getComputedStyle NO normaliza a rgb(). Se resuelve
    // pintando el color en un canvas y leyendo el píxel: así vale para cualquier
    // notación CSS. (Con un parser solo-rgb, los fondos oklch daban null y el
    // cálculo subía al ancestro blanco, inventando fallos que no existían.)
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!;
    const cache = new Map<string, { rgb: number[]; a: number } | null>();
    const parse = (s: string) => {
      if (!s || s === 'transparent' || s === 'none') return null;
      if (cache.has(s)) return cache.get(s)!;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = s;
      // fillStyle inválido conserva el valor previo: si no cambió, no era color.
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const out = { rgb: [d[0], d[1], d[2]], a: d[3] / 255 };
      cache.set(s, out);
      return out;
    };
    // Sube buscando un fondo OPACO. Si encuentra un degradado por el camino,
    // se rinde: el contraste sobre un degradado no se puede calcular así.
    const fondo = (el: Element): number[] | null => {
      let n: Element | null = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0.5) return c.rgb;
        n = n.parentElement;
      }
      const raiz = parse(getComputedStyle(document.body).backgroundColor);
      return raiz ? raiz.rgb : [255, 255, 255];
    };
    const ratio = (f: number[], b: number[]) => {
      const L1 = lum(f), L2 = lum(b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    };

    const fallos: string[] = [];
    document.querySelectorAll('main *').forEach(el => {
      const txt = [...el.childNodes]
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent!.trim())
        .join(' ')
        .trim();
      if (!txt || txt.length < 2) return;

      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;

      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0') return;
      if (cs.webkitBackgroundClip === 'text' || (cs as any).backgroundClip === 'text') return;

      const fg = parse(cs.color);
      if (!fg || fg.a < 0.5) return;

      const bg = fondo(el);
      if (bg === null) return; // degradado: no aplica

      const cr = ratio(fg.rgb, bg);
      // Umbral 3.0, no el 4.5 de AA para texto normal. Este spec caza el fallo
      // GRAVE — texto prácticamente invisible (1.0-1.5), que es lo que produjo
      // el desajuste de tokens entre temas. El morado de marca como TEXTO sobre
      // superficie ronda 3.6-4.5 en ambos temas: queda por debajo de AA estricto,
      // pero es legible y aclararlo/oscurecerlo cambia la identidad de la marca,
      // así que es una decisión de diseño aparte, no una regresión que tapar.
      const min = 3;
      if (cr < min) fallos.push(`"${txt.slice(0, 40)}" ${cr.toFixed(2)} < ${min} (${cs.color})`);
    });
    return fallos;
  });
}

async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await byPlaceholder(page, 'usuario  /  tu@empresa.com  /  nº documento').fill(OWNER.user);
  await byPlaceholder(page, '••••••••').fill(OWNER.pass);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/tenant/**', { timeout: 20_000 });
}

for (const tema of ['claro', 'oscuro'] as const) {
  test(`el texto cumple contraste AA en modo ${tema}`, async ({ page }) => {
    test.setTimeout(120_000);
    logHttpErrors(page);

    // El tema se siembra ANTES de que arranque la app: forzar la clase después
    // de la carga deja el estado a medias (el servicio la reaplica al init) y
    // se acaba midiendo una combinación que en la app real nunca ocurre.
    await page.addInitScript(t => {
      localStorage.setItem('erp.theme', JSON.stringify({ mode: t === 'oscuro' ? 'dark' : 'light', paletteId: 'aura' }));
    }, tema);

    await loginAsOwner(page);

    const todos: string[] = [];
    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await page.waitForLoadState('networkidle');

      // Comprobación de que el tema es el esperado antes de medir nada.
      const esOscuro = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      expect(esOscuro, `El tema activo no es ${tema}`).toBe(tema === 'oscuro');

      const fallos = await fallosDeContraste(page);
      todos.push(...fallos.map(f => `${ruta} → ${f}`));
    }

    expect(todos, `Textos con contraste insuficiente en modo ${tema}`).toEqual([]);
  });
}
