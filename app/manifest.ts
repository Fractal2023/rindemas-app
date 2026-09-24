import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest and linked automatically in <head> by Next.js.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "RindeMás",
    short_name: "RindeMás",
    description: "Haz que la despensa y la quincena te rindan más",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#059669",
    lang: "es-MX",
    dir: "ltr",
    categories: ["finance", "lifestyle", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Precios", url: "/app/precios", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Deudas", url: "/app/deudas", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
