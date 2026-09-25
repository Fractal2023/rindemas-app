# RindeMás

**RindeMás.app** — *Haz que la despensa y la quincena te rindan más.*

Web app móvil de control financiero familiar y tracker de inflación del súper.
Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion. Todo se guarda en `localStorage` bajo la clave `rindemas_data` (los datos de la clave anterior `gastos-familiares:v1` se migran solos).

Paleta: `emerald-600` (acentos, botones, ahorro) · `slate-50`/blanco (fondos) · `rose-600` (alertas y subidas de precio).

```bash
npm install
npm run dev
```

## Estructura

- `app/page.tsx` — landing comercial en `/` (componentes en `components/landing/`)
- `app/app/` — la app: `/app` (Inicio), `/app/precios`, `/app/deudas`, `/app/reportes`
- `components/` — `layout/` (shell, bottom nav), `quick-add/` (registro rápido), `dashboard/`, `prices/`, `debts/`, `reports/`, `ui/`
- `lib/storage.ts` — adaptador de persistencia (LocalStorage, intercambiable)
- `lib/store.ts` — store + acciones (`addExpense`, `payDebt`, `recordPrice`, …) vía `useSyncExternalStore`
- `lib/selectors.ts` — cálculos: balance semanal, variación de precios, reportes
- `lib/replenishment.ts` — (PRO) predicción de reabastecimiento: intervalo promedio entre compras por producto y estado `ok` / `warning` (<3 días) / `critical` (fecha cumplida). Se guarda en `product.replenish` y se recalcula al registrar o borrar una compra. La lista "compra de hoy" vive en `shoppingList`
- `lib/themes.ts` — 5 temas (Esmeralda gratis; Oscuro Neón, Terracota Cálido, Azul Ejecutivo y Morado Menta PRO). Cada tema redefine las variables de color de Tailwind (`--color-emerald-*`, `--color-slate-*`, …), así los componentes no cambian
- `lib/plan.ts` — estado del plan (Gratuito / PRO con prueba de 7 días, $59 MXN/mes) y tema efectivo
- `lib/seed.ts` — `createEmptyState()` (lo que ve un usuario nuevo: la app vacía) y `createDemoState()` (familia de ejemplo, opcional; fechas relativas a hoy)

La app arranca vacía. Para ver datos de ejemplo: Inicio → ⚙️ Ajustes → "Cargar datos de ejemplo" (reemplaza lo registrado; conserva plan, tema y PIN).

## Plan PRO

La prueba gratis se activa localmente (se guarda en `rindemas_data.settings.plan`). **No hay cobro integrado todavía**: al terminar la prueba, la app vuelve al Plan Gratuito y los temas PRO regresan a Esmeralda.

## Privacidad y seguridad

- Los datos viven solo en el navegador del usuario (`localStorage`, clave `rindemas_data`); no hay servidor. **No están cifrados**: cualquiera con acceso al navegador/DevTools puede leerlos.
- Bloqueo por PIN (`lib/security.ts`): se guarda solo un hash SHA-256 con sal. Es un candado de acceso para quien comparte el celular, no cifrado. Se desbloquea por sesión de pestaña (`sessionStorage`). Biometría: pendiente.
- Ajustes → "Exportar o Eliminar definitivamente mis datos": respaldo JSON (sin el hash del PIN) y borrado total con confirmación escrita.

## PWA y modo offline

- `public/sw.js` — service worker propio (sin dependencias). Al instalarse precachea `/`, `/app`, `/app/precios`, `/app/deudas`, `/app/reportes` y todos los `/_next/static/*` que referencian (JS, CSS y fuentes). Páginas y datos RSC: red primero, caché si no hay conexión. Estáticos: caché primero.
- Se registra solo en producción (`components/pwa/ServiceWorkerRegister.tsx`). Para probarlo: `npm run build && npm start`.
- Para forzar que todos los clientes descarten la caché vieja, sube `VERSION` en `public/sw.js`.
- `app/manifest.ts` → `/manifest.webmanifest` (Next.js lo enlaza solo). Íconos PNG en `public/icons/` (regenerar con `npm run icons`).
- iOS: se instala desde Safari → Compartir → "Agregar a inicio" (Apple no muestra aviso de instalación). Android/Chrome muestra el aviso automáticamente.
- En producción el sitio debe servirse por HTTPS para que el service worker funcione.
- Indicador de conexión en la app: `components/pwa/ConnectionStatus.tsx`.

## Registro por voz

- `lib/voice/parsePurchase.ts` — convierte la frase dictada en producto, cantidad, unidad y precio (regex + números en palabras, "medio kilo", "con 50 centavos", precio por unidad con "a/de/cada/el kilo"). Hace match contra el catálogo del usuario. Sin dependencias.
- `lib/voice/speech.ts` — envoltorio de la Web Speech API (`es-MX`). Usa reconocimiento **en el dispositivo** (`processLocally`, Chrome reciente) cuando está disponible: ese modo funciona sin internet y el audio no sale del celular. Si no, usa el dictado en línea del navegador (Google/Apple), que necesita internet; la app pide consentimiento una vez (`settings.voiceCloudConsent`, se puede revocar en Ajustes → Privacidad).
- UI: micrófono en el registro rápido (`components/voice/VoiceCapture.tsx`) y botón flotante en `/app` (`VoiceFab.tsx`, oculto si el navegador no soporta dictado).
- **Exclusivo de PRO**: se valida con `planStatus(settings.plan).isPro` (una prueba vencida cuenta como Gratuito). En Plan Gratuito los micrófonos llevan corona y abren `VoiceProGate.tsx`, que lleva a la pantalla de planes (`ProSheet` con `reason="voice"`).

## Suscripciones (PRO)

- Ruta `/app/suscripciones` (acceso desde Inicio y Deudas). En Plan Gratuito muestra un paywall que abre `ProSheet` con `reason="subscriptions"`.
- `lib/subscriptions.ts` — store propio en LocalStorage con la clave `rindemas_subscriptions`: alta, cancelar, reactivar, "me la quedo" (la prueba pasa a activa) y eliminar. Resumen mensual/anual, próximo cobro y semáforo de pruebas gratis (faltan 3 días = amarillo; 2, 1 o 0 = rojo). "Ir a cancelar" usa el link o la nota guardada.
- Arranca vacío; se incluye en el respaldo JSON, en "Cargar datos de ejemplo" y en "Eliminar definitivamente". Cada suscripción se puede editar y eliminar. El service worker precachea la ruta (`VERSION = "v2"`).

## Editar y eliminar

- Productos del tracker (Precios): lápiz para editar nombre, unidad, categoría y **corregir** el último precio capturado (no crea un registro nuevo); bote de basura siempre visible, con confirmación. Las compras pasadas se conservan.
- Suscripciones: "Editar" y eliminar en todas las tarjetas (activas, en prueba y canceladas).

## Ingresos extra, gastos extra y préstamos

- `lib/localList.ts` — lista persistida genérica (una clave de LocalStorage por lista).
- `lib/extras.ts` — ingresos extra (`rindemas_extra_incomes`: venta, trabajo independiente, bono, regalo) y gastos extra / imprevistos (`rindemas_extra_expenses`: salud, emergencia, reparaciones, gusto ocasional). Suman / restan al disponible de la semana; **no** entran en los reportes de necesidad vs. gusto, para no distorsionar el promedio de despensa. Vista `/app/extras` con el resumen "Gastos Ocasionales del Mes".
- `lib/loans.ts` — préstamos a plazos (`rindemas_loans`; Plan Gratuito: 1 activo, PRO: ilimitados + recordatorios en la app cuando un pago vence en ≤3 días): total con intereses, plazo en meses o quincenas, día límite; cuota = total ÷ plazo; "Registrar pago de cuota" (resta del disponible) y "Deshacer último pago". Vista `/app/prestamos`.
- Registro rápido: tipos "Ingreso" y "Extra". En el dictado (PRO), `lib/voice/parseIntent.ts` clasifica "ingreso extra", "bono", "vendí…" como entrada de dinero y "gasto extra", "emergencia", "consulta", "plomero"… como gasto extra.
- Todos los ítems tienen editar y eliminar visibles. Se incluyen en el respaldo JSON, en "Cargar datos de ejemplo" y en "Eliminar definitivamente".
