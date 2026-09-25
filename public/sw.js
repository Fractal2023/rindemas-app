/* RindeMás service worker — offline-first shell for the app.
 *
 * All finance data lives in LocalStorage, so being "offline" only requires the
 * HTML, JS, CSS and fonts. Strategy:
 *   - install:   precache the /app routes + landing, plus every /_next/static
 *                asset they reference (scripts, CSS and the fonts inside the CSS)
 *   - pages:     network first (fresh after deploys), cached copy when offline
 *   - /_next/static, icons: cache first (file names are content-hashed)
 *   - RSC data:  network first, cached copy when offline; if there is none the
 *                request fails and Next.js falls back to a full page load, which
 *                is then served from the page cache.
 *
 * Bump VERSION to force every client to drop old caches.
 */
const VERSION = "v3";
const PAGES = `rindemas-pages-${VERSION}`;
const ASSETS = `rindemas-assets-${VERSION}`;
const RSC = `rindemas-rsc-${VERSION}`;

const ROUTES = ["/app", "/app/precios", "/app/deudas", "/app/reportes", "/app/suscripciones", "/app/extras", "/app/prestamos", "/"];
const STATIC_FILES = [
  "/manifest.webmanifest",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const NETWORK_TIMEOUT_MS = 4000;

const assetUrlsIn = (text) => [...new Set(text.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])];

async function precache() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const found = new Set();

  await Promise.all(
    ROUTES.map(async (route) => {
      const res = await fetch(route, { cache: "no-store" });
      if (!res.ok) throw new Error(`Precache failed for ${route}: ${res.status}`);
      const html = await res.clone().text();
      await pages.put(route, res);
      assetUrlsIn(html).forEach((u) => found.add(u));
    }),
  );

  // CSS files reference the self-hosted fonts.
  const css = [...found].filter((u) => u.endsWith(".css"));
  await Promise.all(
    css.map(async (u) => {
      const res = await fetch(u);
      if (res.ok) assetUrlsIn(await res.clone().text()).forEach((a) => found.add(a));
    }),
  );

  await assets.addAll([...STATIC_FILES, ...found]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, ASSETS, RSC]);
      for (const key of await caches.keys()) {
        if (key.startsWith("rindemas-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

/** Pages are cached by pathname only (no query string, trailing slash trimmed). */
function pageKey(url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return new Request(new URL(path, url.origin).href);
}

/**
 * RSC payloads depend on the pathname and on the router headers, not on the
 * `_rsc` cache-busting param, so build a stable key from those.
 */
function rscKey(request, url) {
  const key = new URL(url.pathname, url.origin);
  key.searchParams.set("__rsc", "1");
  for (const h of ["next-router-prefetch", "next-router-segment-prefetch"]) {
    const v = request.headers.get(h);
    if (v) key.searchParams.set(h, v);
  }
  return new Request(key.href);
}

async function networkFirst(request, cacheName, key, { fallbackToAppShell = false } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([fetch(request), timeout(NETWORK_TIMEOUT_MS)]);
    if (res.ok && res.type === "basic") cache.put(key, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(key);
    if (cached) return cached;
    if (fallbackToAppShell) {
      const shell = await cache.match(new Request(new URL("/app", self.location.origin).href));
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.headers.get("rsc") === "1") {
    event.respondWith(networkFirst(request, RSC, rscKey(request, url)));
    return;
  }

  if (request.mode === "navigate") {
    const inApp = url.pathname === "/app" || url.pathname.startsWith("/app/");
    event.respondWith(networkFirst(request, PAGES, pageKey(url), { fallbackToAppShell: inApp }));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
