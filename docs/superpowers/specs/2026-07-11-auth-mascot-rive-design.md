# Refactor visual de Auth + mascota interactiva (Rive)

**Fecha:** 2026-07-11
**Alcance:** `login`, `register`, `admin-login` (comparten `auth-layout`) en `C:\SaasFront`.
**Objetivo:** refresco visual completo de las vistas de autenticación y una mascota
animada **interactiva** en el panel izquierdo (hoy un bloque terracota plano "sin diseño"),
con el formulario a la derecha.

## Corrección técnica clave
El archivo `28088-53050-ai-orb-mascot.riv` es **Rive**, no Lottie. Lottie sólo
reproduce `.json` y no puede cargar `.riv`. La mascota trae una **state machine**
("State Machine 1") con entradas: `typingBoolean`, `loadingBoolean` (bool) y
`correct`, `wrong`, `jump` (triggers); estados Idle/Typing/Loading/Correct/Wrong/Reveal
y ojos (Eye L/R + Third Eye). Se integra con el **runtime de Rive** (`@rive-app/canvas`).

> Los nombres exactos de las entradas se confirman en runtime (log de
> `stateMachineInputs`); el componente degrada con gracia si alguna no existe.

## Restricciones (duras)
- NO tocar APIs, endpoints, modelos, servicios backend, permisos ni lógica de negocio.
  La mascota sólo **reacciona a eventos de UI que ya ocurren** (foco, escritura, submit,
  éxito, error). No añade flujos ni validaciones.
- E2E 14/14 verde: preservar placeholders, roles y nombres accesibles de botón que usan
  los specs de auth. Ajustar specs sólo si cambia estructura, en el mismo cambio lógico.
- Mantener theming dinámico (primary OKLCH por tenant), Angular standalone + signals,
  Tailwind v4, y `prefers-reduced-motion`.
- El asistente **no hace commits**; sólo el usuario.

## Arquitectura

### 1. `shared/ui/mascot/mascot.component.ts` (nuevo, reutilizable)
- Standalone. Renderiza un `<canvas>` y carga el `.riv` con `@rive-app/canvas`.
- Inputs (signals): `src` (ruta del .riv, default el orb), `typing: boolean`,
  `loading: boolean`, `stateMachine: string` (default `'State Machine 1'`).
- Métodos públicos: `celebrate()` (dispara `correct`), `reject()` (dispara `wrong`),
  `jump()`.
- `effect()` empuja `typing`/`loading` a los inputs bool de la SM.
- Descubre inputs vía `rive.stateMachineInputs(name)`; guarda referencias y **degrada
  silenciosamente** si un input/trigger no existe.
- `ngOnDestroy` → `rive.cleanup()`. Si `prefers-reduced-motion`, muestra un frame
  estático (no autoplay) o el estado Idle sin bucles intensos.
- Responsive: el canvas se ajusta al contenedor (`layout: 'fit'`, `ResizeObserver`).

### 2. `core/auth/auth-mascot.service.ts` (nuevo, bus de UI)
- `providedIn: 'root'`. Estado con signals: `typing`, `loading` (bool) y un canal de
  "pulsos" (`celebrate()`, `reject()`, `jump()`) que el host consume (p. ej. `signal`
  contador o `Subject`).
- Login/register/admin-login lo inyectan y llaman en sus handlers existentes:
  - `focusin`/input en cualquier campo → `typing.set(true)`; `focusout`/idle → `false`.
  - foco en campo password → pulso "cover eyes"; toggle "ver" → "reveal".
  - submit start → `loading.set(true)`.
  - success → `loading.set(false)` + `celebrate()`.
  - error → `loading.set(false)` + `reject()`.
- Se resetea al cambiar de ruta de auth (o en el `ngOnDestroy` de cada page).

### 3. `layouts/auth-layout` (refactor)
- Panel izquierdo (`hidden lg:flex`): fondo premium (gradiente sutil derivado de
  `--color-primary-*` OKLCH + textura/vignette ligera), **mascota** centrada,
  **wordmark/logo del tenant + tagline corta discretos** (decisión: marca discreta).
  Toggle de tema se mantiene.
- Hospeda `<app-mascot>` enlazado al `AuthMascotService` (typing/loading/celebrate/reject).
- Panel derecho: `router-outlet` con el formulario (misma posición).
- Móvil (`< lg`): la mascota pasa a una **franja compacta arriba** del formulario
  (no se elimina), con el wordmark.

### 4. Refactor visual de los forms
- Elevar jerarquía tipográfica (escala ya existente: display/h1/h2/caption), ritmo/espaciado
  y estados de carga/éxito/error explícitos (ya presentes: `role="alert"`, spinners).
- Mantener toggle de ver contraseña, stepper del wizard de registro.
- Split-screen premium, coherente en light/dark.

### 5. Asset
- Copiar `28088-53050-ai-orb-mascot.riv` → `C:\SaasFront\public\mascot\ai-orb-mascot.riv`
  (Angular sirve `public/**`).

## Mapeo interactivo (interactividad completa)
| Evento de UI (ya existe)      | Reacción de la mascota      |
|-------------------------------|-----------------------------|
| Escribir/foco en un campo     | `typing = true`             |
| Blur / sin foco               | `typing = false`            |
| Foco en contraseña            | tapar ojos (si SM lo soporta) |
| Toggle "ver contraseña"       | reveal / destapar           |
| Enviar formulario             | `loading = true`            |
| Login/registro OK             | `celebrate()` (correct)     |
| Login/registro con error      | `reject()` (wrong)          |
| Hover del botón principal     | `jump()`                    |

## Verificación
1. `npx ng build --configuration development` → 0 errores, sin warnings nuevos.
2. `npm run e2e` → 14/14 verde (ajustar specs sólo si cambia estructura).
3. Capturas Preview MCP: desktop + móvil, light + dark, mostrando la mascota en
   idle / typing / loading / correct / wrong.

## Riesgos
- Nombres reales de las entradas de la SM: se confirman en runtime; el componente degrada
  si difieren.
- Peso/tamaño del runtime de Rive: `@rive-app/canvas` es liviano (canvas 2D/WebGL opcional);
  se importa sólo en el componente de la mascota (lazy vía la ruta de auth).
- E2E: la mascota vive en un `<canvas>` sin roles que interfieran; se preservan los
  selectores de formulario.
