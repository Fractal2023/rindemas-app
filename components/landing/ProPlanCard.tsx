"use client";

import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BillingToggle } from "@/components/plan/BillingToggle";
import { ThemeSwatch } from "@/components/plan/ThemeSwatch";
import { billingBadge, billingOption, DEFAULT_BILLING, monthlyEquivalent, TRIAL_DAYS } from "@/lib/plan";
import { THEMES } from "@/lib/themes";
import type { BillingPeriod } from "@/lib/types";
import { formatMXN } from "@/lib/utils";

const PRO = [
  "Todo lo del plan Gratuito",
  "Registro rápido por voz, sin tocar la pantalla",
  "Alertas antes de que se cobre una prueba gratis, con link para cancelar",
  "Predicción de lo que se te va a acabar y sugerencias de compra",
  "Préstamos a plazos ilimitados, con recordatorios de pago en la app",
];

const PRO_SOON = ["Alertas de precio personalizadas", "Metas de ahorro por quincena", "Reportes para descargar en PDF y Excel"];

/** Landing PRO pricing card with the Mensual / Trimestral / Semestral / Anual selector. */
export function ProPlanCard() {
  const [billing, setBilling] = useState<BillingPeriod>(DEFAULT_BILLING);
  const option = billingOption(billing);
  const badge = billingBadge(option);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-[0_30px_60px_-30px_rgba(5,150,105,0.7)] sm:p-7">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-bold">
          <Crown className="size-5" /> RindeMás PRO
        </p>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{TRIAL_DAYS} días gratis</span>
      </div>

      <div className="mt-4">
        <BillingToggle id="landing" value={billing} onChange={setBilling} tone="onDark" />
      </div>

      <motion.div key={billing} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="font-display text-5xl font-extrabold tabular-nums">${option.price}</span>
          <span className="text-sm text-white/80">MXN {option.per}</span>
          {badge && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-emerald-700">{badge}</span>}
        </p>
        <p className="mt-1 text-xs text-white/80">
          {option.months === 1
            ? "Pago mes a mes."
            : `Equivale a ${formatMXN(monthlyEquivalent(option))} al mes, en un solo pago ${option.every}.`}
        </p>
      </motion.div>

      <ul className="mt-6 space-y-3 text-sm">
        {PRO.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-200" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl bg-white/10 p-3.5">
        <p className="text-[11px] font-bold tracking-wide text-white/70 uppercase">Próximamente</p>
        <ul className="mt-2 space-y-1.5 text-xs text-white/80">
          {PRO_SOON.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/60" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <p className="flex gap-2.5 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-200" />4 temas exclusivos e interfaz sin restricciones
        </p>
        <div className="mt-3 flex gap-2" aria-hidden>
          {THEMES.filter((t) => t.tier === "pro").map((t) => (
            <ThemeSwatch key={t.id} theme={t} className="w-14 ring-1 ring-white/30" />
          ))}
        </div>
      </div>
      <Link
        href="/app"
        className="mt-6 rounded-full bg-white py-3.5 text-center font-bold text-emerald-700 transition hover:bg-emerald-50"
      >
        Probar {TRIAL_DAYS} días gratis · Plan {option.label}
      </Link>
      <p className="mt-2 text-center text-xs text-white/75">
        Después ${option.price} MXN {option.every}. Actívala desde Ajustes, dentro de la app.
      </p>
    </div>
  );
}
