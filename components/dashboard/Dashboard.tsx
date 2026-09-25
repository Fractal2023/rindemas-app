"use client";

import { ArrowDownLeft, ArrowUpRight, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuickAdd } from "@/components/layout/AppShell";
import { PlanBadge } from "@/components/plan/PlanBadge";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { debtTotals, weeklySummary } from "@/lib/selectors";
import { useFinanceState } from "@/lib/store";
import { formatMXN, longToday } from "@/lib/utils";
import { InflationAlerts } from "./InflationAlerts";
import { RunningLowCard } from "./RunningLowCard";
import { SettingsSheet } from "./SettingsSheet";
import { TransactionList } from "./TransactionList";
import { WeeklyBalanceCard } from "./WeeklyBalanceCard";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export function Dashboard() {
  const state = useFinanceState();
  const { openQuickAdd } = useQuickAdd();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSession, setSettingsSession] = useState(0);
  const openSettings = () => {
    setSettingsSession((n) => n + 1);
    setSettingsOpen(true);
  };
  const summary = weeklySummary(state);
  const { owe, owed } = debtTotals(state);
  const recent = state.transactions.slice(0, 8);

  return (
    <div className="space-y-5 px-5 pt-6">
      <header className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo />
          <button
            onClick={openSettings}
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50"
            aria-label="Ajustes"
          >
            <Settings className="size-5" />
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500">{longToday()}</p>
            <PlanBadge />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {greeting()}, <span className="text-emerald-600">{state.settings.familyName}</span>
          </h1>
        </div>
      </header>

      <WeeklyBalanceCard summary={summary} onEditIncome={openSettings} />

      <RunningLowCard products={state.products} shoppingList={state.shoppingList} />

      <Link href="/app/deudas" className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="grid size-6 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="size-3.5" />
            </span>
            Debo
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">{formatMXN(owe)}</p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="grid size-6 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="size-3.5" />
            </span>
            Me deben
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">{formatMXN(owed)}</p>
        </div>
      </Link>

      <InflationAlerts products={state.products} />

      <section className="rounded-3xl bg-white px-5 pt-5 pb-2 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Actividad reciente</h2>
          <Link href="/app/reportes" className="text-xs font-bold text-emerald-700">
            Ver reportes
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">Aún no hay movimientos.</p>
            <button onClick={() => openQuickAdd()} className="mt-2 text-sm font-bold text-emerald-600">
              Registrar mi primer gasto
            </button>
          </div>
        ) : (
          <TransactionList transactions={recent} />
        )}
      </section>

      <SettingsSheet open={settingsOpen} session={settingsSession} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
