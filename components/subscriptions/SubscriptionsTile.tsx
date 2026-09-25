"use client";

import { CalendarClock, ChevronRight, Crown } from "lucide-react";
import Link from "next/link";
import { planStatus } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";
import { summarize, trialAlert, urgentTrials, useSubscriptions } from "@/lib/subscriptions";
import { cn, formatMXN } from "@/lib/utils";

/** Dashboard entry to /app/suscripciones. Free users see it as a PRO feature. */
export function SubscriptionsTile() {
  const { settings } = useFinanceState();
  const isPro = planStatus(settings.plan).isPro;
  const items = useSubscriptions();
  const summary = summarize(items);
  const urgent = urgentTrials(items);
  const first = urgent[0];
  const firstAlert = first ? trialAlert(first) : null;

  return (
    <Link
      href="/app/suscripciones"
      className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition hover:bg-slate-50"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CalendarClock className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-bold text-slate-900">
          Suscripciones
          {!isPro && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <Crown className="size-2.5" /> PRO
            </span>
          )}
        </span>
        {isPro ? (
          <span className="block truncate text-xs text-slate-500">
            {formatMXN(Math.round(summary.monthly))}/mes · {summary.activeCount} activas
            {summary.trialCount > 0 && ` · ${summary.trialCount} en prueba`}
          </span>
        ) : (
          <span className="block truncate text-xs text-slate-500">Que ninguna prueba gratis se te cobre sin avisar</span>
        )}
        {isPro && first && firstAlert && (
          <span
            className={cn(
              "mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[11px] font-semibold",
              firstAlert.level === "critical" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700",
            )}
          >
            <span className="truncate">
              {first.name}: {firstAlert.daysLeft === 0 ? "cancela hoy" : `faltan ${firstAlert.daysLeft} días`}
              {urgent.length > 1 && ` · +${urgent.length - 1}`}
            </span>
          </span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-300" />
    </Link>
  );
}
