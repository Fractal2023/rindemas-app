import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

const LINKS = [
  { href: "#funciones", label: "Funciones" },
  { href: "#privacidad", label: "Privacidad" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas", label: "Preguntas" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Principal">
        <Link href="/" aria-label="RindeMás, inicio">
          <BrandLogo showSlogan={false} className="[&_svg]:size-8 [&_p]:text-lg" />
        </Link>
        <ul className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-slate-900">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/app"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700"
        >
          Abrir la app
        </Link>
      </nav>
    </header>
  );
}
