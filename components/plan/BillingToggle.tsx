"use client";

import { motion } from "framer-motion";
import { BILLING_OPTIONS, billingBadge } from "@/lib/plan";
import type { BillingPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  /** "onDark" for the green PRO cards, "light" for white surfaces. */
  tone?: "light" | "onDark";
}

/** Mensual / Trimestral / Semestral / Anual selector with its saving tag under each option. */
export function BillingToggle({ id, value, onChange, tone = "light" }: Props) {
  const dark = tone === "onDark";
  return (
    <div
      role="radiogroup"
      aria-label="Frecuencia de pago"
      className={cn("grid grid-cols-4 gap-1 rounded-2xl p-1", dark ? "bg-black/15" : "bg-slate-100")}
    >
      {BILLING_OPTIONS.map((o) => {
        const active = o.id === value;
        const badge = billingBadge(o);
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative flex min-h-12 flex-col items-center justify-center rounded-xl px-1 py-1.5 text-center transition-colors",
              active ? (dark ? "text-emerald-800" : "text-slate-900") : dark ? "text-white/80 hover:text-white" : "text-slate-500",
            )}
          >
            {active && (
              <motion.span
                layoutId={`billing-${id}`}
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative text-[11px] font-bold sm:text-xs">{o.label}</span>
            {badge && (
              <span
                className={cn(
                  "relative mt-0.5 text-[9px] leading-tight font-bold whitespace-nowrap sm:text-[10px]",
                  active ? "text-emerald-600" : dark ? "text-emerald-200" : "text-emerald-600",
                )}
              >
                {badge.replace("Ahorra ", "-").replace(" meses GRATIS", " meses gratis")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
