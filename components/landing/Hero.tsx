import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Receipt } from "./Receipt";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgba(16,185,129,0.12),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-20 md:pb-24">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Control de gastos para familias en México</p>
          <h1 className="font-display mt-4 text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.03em] text-balance text-slate-900 sm:text-6xl md:text-[3.4rem] lg:text-[4.1rem] xl:text-7xl">
            Haz que la despensa y la quincena te{" "}
            <span className="relative whitespace-nowrap text-emerald-600">
              rindan más
              <svg viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full text-emerald-300" aria-hidden preserveAspectRatio="none">
                <path d="M2 11 C 60 3, 140 3, 298 9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Anota lo que compras en segundos y RindeMás te dice cuánto te queda para la semana, qué productos subieron en el súper y
            cómo van tus tandas y préstamos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
            >
              Empezar gratis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#funciones" className="rounded-full px-5 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100">
              Ver cómo funciona
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-emerald-500" />Sin crear cuenta</li>
            <li className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-emerald-500" />Tus datos se quedan en tu celular</li>
            <li className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-emerald-500" />Plan gratuito</li>
          </ul>
        </div>

        <Receipt />
      </div>
    </section>
  );
}
