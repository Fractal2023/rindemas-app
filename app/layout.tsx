import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { STORAGE_KEY } from "@/lib/storage";
import { DEFAULT_THEME, themeBootScript, themeStylesheet } from "@/lib/themes";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rindemas.app"),
  title: { default: "RindeMás · Haz que la despensa y la quincena te rindan más", template: "%s · RindeMás" },
  description:
    "RindeMás: control de gastos familiares y tracker de inflación del súper. Haz que la despensa y la quincena te rindan más.",
  applicationName: "RindeMás",
  appleWebApp: { capable: true, title: "RindeMás", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "RindeMás",
    title: "RindeMás · Haz que la despensa y la quincena te rindan más",
    description: "Controla tus gastos, sigue la inflación del súper y organiza deudas y tandas. Gratis y sin registro.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is replaced before paint by the boot script, hence suppressHydrationWarning.
    <html lang="es-MX" data-theme={DEFAULT_THEME} className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStylesheet() }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(STORAGE_KEY) }} />
      </head>
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
