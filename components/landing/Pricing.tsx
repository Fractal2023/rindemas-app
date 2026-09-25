import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { PRO_PRICE_MXN, TRIAL_DAYS } from "@/lib/plan";
import { THEMES } from "@/lib/themes";
import { ThemeSwatch } from "@/components/plan/ThemeSwatch";

const FREE = [
  "Balance semanal y disponible por día",
  "Tracker de precios con subidas y bajadas",
  "Deudas, préstamos, tandas y fiados",
  "Reportes de necesidad vs. gusto",
  "Bloqueo con PIN, respaldo y borrado",
  "Tema Esmeralda",
];

const PRO: { text: string; soon?: boolean }[] = [
  { text: "Todo lo del plan Gratuito" },
  { text: "Registro de compras por voz" },
  { text: "Gestor de suscripciones con aviso antes de que se cobre una prueba gratis" },
  { text: "4 temas exclusivos: Oscuro Neón, Terracota, Azul Ejecutivo y Morado Menta" },
  { text: "Alertas de precio personalizadas", soon: true },
  { text: "Metas de ahorro por quincena", soon: true },
  { text: "Reportes para descargar en PDF y Excel", soon: true },
];

export function Pricing() {
  return (
    <section id="planes" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700">Planes</p>
          <h2 className="font-display mt-2 text-4xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-5xl">
            Lo esencial es gratis.
          </h2>
          <p className="mt-4 text-lg text-slate-600">PRO es para quien quiere más: temas visuales y herramientas extra.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl p-7 ring-1 ring-slate-200">
            <p className="font-bold text-slate-900">Gratuito</p>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold text-slate-900">$0</span>
              <span className="text-sm text-slate-500">MXN</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
              {FREE.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-8 rounded-full bg-slate-900 py-3.5 text-center font-bold text-white transition hover:bg-slate-800"
            >
              Empezar gratis
            </Link>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-7 text-white shadow-[0_30px_60px_-30px_rgba(5,150,105,0.7)]">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold">
                <Crown className="size-5" /> RindeMás PRO
              </p>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{TRIAL_DAYS} días gratis</span>
            </div>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold">${PRO_PRICE_MXN}</span>
              <span className="text-sm text-white/80">MXN al mes</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {PRO.map((f) => (
                <li key={f.text} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-200" />
                  <span>
                    {f.text}
                    {f.soon && (
                      <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                        Próximamente
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2" aria-hidden>
              {THEMES.filter((t) => t.tier === "pro").map((t) => (
                <ThemeSwatch key={t.id} theme={t} className="w-14 ring-1 ring-white/30" />
              ))}
            </div>
            <Link
              href="/app"
              className="mt-6 rounded-full bg-white py-3.5 text-center font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              Probar {TRIAL_DAYS} días gratis
            </Link>
            <p className="mt-2 text-center text-xs text-white/75">Actívala desde Ajustes, dentro de la app.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
