import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BRAND, BrandLogo } from "@/components/ui/BrandLogo";

export function FinalCta() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-16 text-center sm:px-12 md:py-20">
        <h2 className="font-display mx-auto max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-[-0.02em] text-white sm:text-6xl">
          Empieza con la despensa de esta semana.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          Abre la app, anota tu próxima compra y mira cuánto te queda. Sin cuenta y sin tarjeta.
        </p>
        <Link
          href="/app"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-4 text-base font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          Abrir RindeMás
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogo />
        <div className="flex flex-col gap-1 text-sm text-slate-500 sm:items-end">
          <nav className="flex gap-5" aria-label="Pie de página">
            <a href="#funciones" className="hover:text-slate-900">Funciones</a>
            <a href="#privacidad" className="hover:text-slate-900">Privacidad</a>
            <a href="#planes" className="hover:text-slate-900">Planes</a>
          </nav>
          <p>
            © {new Date().getFullYear()} {BRAND.domain} · Hecho en México
          </p>
        </div>
      </div>
    </footer>
  );
}
