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
- `lib/themes.ts` — 5 temas (Esmeralda gratis; Oscuro Neón, Terracota Cálido, Azul Ejecutivo y Morado Menta PRO). Cada tema redefine las variables de color de Tailwind (`--color-emerald-*`, `--color-slate-*`, …), así los componentes no cambian
- `lib/plan.ts` — estado del plan (Gratuito / PRO con prueba de 7 días, $59 MXN/mes) y tema efectivo
- `lib/seed.ts` — datos demo (se cargan si `localStorage` está vacío; relativos a la fecha actual)

Para volver a los datos demo: Inicio → ⚙️ Ajustes → "Restablecer datos demo".

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
