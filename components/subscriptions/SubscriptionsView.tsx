"use client";

import { AnimatePresence } from "framer-motion";
import { CalendarClock, ChevronDown, Crown, Lock, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAppActions } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { planStatus } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";
import { daysUntil, summarize, useSubscriptions, type Subscription } from "@/lib/subscriptions";
import { cn, formatMXN } from "@/lib/utils";
import { NewSubscriptionSheet } from "./NewSubscriptionSheet";
import { SubscriptionCard } from "./SubscriptionCard";

/** /app/suscripciones — PRO only; Plan Gratuito users get a paywall. */
export function SubscriptionsView() {
  const { settings } = useFinanceState();
  return planStatus(settings.plan).isPro ? <SubscriptionsManager /> : <SubscriptionsPaywall />;
}

function SubscriptionsPaywall() {
  const { openProSheet } = useAppActions();
  return (
    <div>
      <PageHeader title="Suscripciones" subtitle="Streaming, apps y pruebas gratis" />
      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          {/* Blurred preview of what's behind the paywall */}
          <div className="pointer-events-none space-y-2 blur-[3px] select-none" aria-hidden>
            {[
              ["Netflix", "$249/mes", "bg-slate-100"],
              ["Disney+ · prueba", "Faltan 2 días", "bg-rose-100"],
              ["Spotify", "$199/mes", "bg-slate-100"],
            ].map(([name, meta, bg]) => (
              <div key={name} className={cn("flex justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700", bg)}>
                <span>{name}</span>
                <span>{meta}</span>
              </div>
            ))}
          </div>
          <div className="relative -mt-8">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30">
              <Lock className="size-6" />
            </span>
            <p className="mt-4 text-lg font-extrabold text-slate-900">Gestor de suscripciones</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
              Ve cuánto pagas al mes en streaming y apps, y recibe un aviso antes de que una prueba gratis se convierta en cobro.
              Es exclusivo de RindeMás PRO.
            </p>
            <button
              type="button"
              onClick={() => openProSheet(undefined, "subscriptions")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
            >
              <Crown className="size-4" /> Ver RindeMás PRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold text-slate-500">
        {title} · {count}
      </h2>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </ul>
    </section>
  );
}

function SubscriptionsManager() {
  const items = useSubscriptions();
  const [sheet, setSheet] = useState({ open: false, session: 0 });
  const [showCancelled, setShowCancelled] = useState(false);
  const summary = summarize(items);

  const byDeadline = (a: Subscription, b: Subscription) =>
    (a.cancelBy ? daysUntil(a.cancelBy) : 9999) - (b.cancelBy ? daysUntil(b.cancelBy) : 9999);
  const trials = items.filter((s) => s.status === "activa" && s.isTrial).sort(byDeadline);
  const active = items.filter((s) => s.status === "activa" && !s.isTrial).sort((a, b) => b.amount - a.amount);
  const cancelled = items.filter((s) => s.status === "cancelada");

  return (
    <div>
      <PageHeader
        title="Suscripciones"
        subtitle="Streaming, apps y pruebas gratis"
        action={
          <button
            onClick={() => setSheet((s) => ({ open: true, session: s.session + 1 }))}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
          >
            <Plus className="size-4" /> Nueva
          </button>
        }
      />

      <div className="space-y-5 px-5">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-xl shadow-emerald-700/30">
          <div className="pointer-events-none absolute -top-14 -right-8 size-40 rounded-full bg-white/10" />
          <p className="relative text-sm text-white/80">Pagas en suscripciones</p>
          <p className="relative text-4xl font-extrabold tracking-tight tabular-nums">
            {formatMXN(Math.round(summary.monthly))}
            <span className="text-lg font-semibold text-white/80">/mes</span>
          </p>
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/15 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-white/80">Proyección anual</p>
              <p className="text-base font-bold tabular-nums">{formatMXN(Math.round(summary.yearly))}/año</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-white/80">Activas</p>
              <p className="text-base font-bold tabular-nums">{summary.activeCount}</p>
            </div>
          </div>
          {summary.trialCount > 0 && (
            <p className="relative mt-3 rounded-2xl bg-black/15 px-3.5 py-2 text-xs">
              Si no cancelas tus {summary.trialCount} {summary.trialCount === 1 ? "prueba" : "pruebas"} a tiempo, pagarás{" "}
              <b>+{formatMXN(Math.round(summary.trialsMonthly))}/mes</b>.
            </p>
          )}
        </section>

        {items.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-100">
            <CalendarClock className="mx-auto size-8 text-emerald-600" />
            <p className="mt-3 font-semibold text-slate-800">Agrega tu primera suscripción</p>
            <p className="mt-1 text-sm text-slate-500">Netflix, Spotify, el gimnasio o esa prueba gratis que no quieres que se cobre.</p>
          </div>
        )}

        <Group title="Periodos de prueba" count={trials.length}>
          {trials.map((s) => (
            <SubscriptionCard key={s.id} sub={s} />
          ))}
        </Group>

        <Group title="Activas" count={active.length}>
          {active.map((s) => (
            <SubscriptionCard key={s.id} sub={s} />
          ))}
        </Group>

        {cancelled.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowCancelled((v) => !v)}
              className="flex w-full items-center justify-between px-1 pb-2 text-sm font-bold text-slate-500"
              aria-expanded={showCancelled}
            >
              Canceladas · {cancelled.length}
              <ChevronDown className={cn("size-4 transition-transform", showCancelled && "rotate-180")} />
            </button>
            {showCancelled && (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {cancelled.map((s) => (
                    <SubscriptionCard key={s.id} sub={s} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        )}
      </div>

      <NewSubscriptionSheet
        open={sheet.open}
        session={sheet.session}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
