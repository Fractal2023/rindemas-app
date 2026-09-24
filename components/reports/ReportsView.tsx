"use client";

import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { KIND_STYLE } from "@/lib/icons";
import { breakdown, categoryTotals, txInWeek, type Breakdown } from "@/lib/selectors";
import { useFinanceState } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { cn, formatMXN, formatPct, isInRange, shortDate, weekRange } from "@/lib/utils";
import { DonutChart } from "./DonutChart";

type Period = "week" | "last" | "month";

const SERIES = [
  { key: "necesidad", label: "Necesidad", sub: "Despensa y básicos", color: "var(--color-emerald-600)", dot: "bg-emerald-600" },
  { key: "gusto", label: "Gusto", sub: "Antojos y salidas", color: "var(--color-amber-400)", dot: "bg-amber-400" },
  { key: "deudas", label: "Deudas", sub: "Abonos y tandas", color: "var(--color-sky-400)", dot: "bg-sky-400" },
] as const;

function periodTx(all: Transaction[], period: Period): { current: Transaction[]; previous: Transaction[] } {
  if (period === "week") return { current: txInWeek(all, 0), previous: txInWeek(all, -1) };
  if (period === "last") return { current: txInWeek(all, -1), previous: txInWeek(all, -2) };
  const [start] = weekRange(-3);
  const [, end] = weekRange(0);
  const [pStart] = weekRange(-7);
  return {
    current: all.filter((t) => isInRange(t.date, [start, end])),
    previous: all.filter((t) => isInRange(t.date, [pStart, start])),
  };
}

function insight(b: Breakdown, income: number, weeks: number) {
  if (b.total === 0) return "Aún no hay gastos en este periodo. Registra tus compras con el botón +.";
  const pct = (n: number) => Math.round(n * 100);
  const gustoShare = b.gusto / b.total;
  const debtShare = b.deudas / b.total;
  if (gustoShare > 0.3)
    return `Los gustos son el ${pct(gustoShare)}% de tu gasto. Reducirlos a la mitad te dejaría ${formatMXN(Math.round(b.gusto / 2))} extra.`;
  if (debtShare > 0.4)
    return `El ${pct(debtShare)}% de lo que salió fue para abonos (${pct(b.deudas / (income * weeks || 1))}% de tu ingreso). Liquidar primero la deuda más pequeña libera dinero más rápido.`;
  return `¡Buen balance! El ${pct(b.necesidad / b.total)}% de tu gasto se fue a necesidades y solo el ${pct(gustoShare)}% a gustos.`;
}

export function ReportsView() {
  const { transactions, settings } = useFinanceState();
  const [period, setPeriod] = useState<Period>("week");

  const { current, previous } = useMemo(() => periodTx(transactions, period), [transactions, period]);
  const b = breakdown(current);
  const prev = breakdown(previous);
  const change = prev.total > 0 ? ((b.total - prev.total) / prev.total) * 100 : null;
  const categories = categoryTotals(current).slice(0, 6);
  const maxCat = categories[0]?.amount ?? 1;

  const weeks = useMemo(
    () =>
      [-3, -2, -1, 0].map((offset) => {
        const [start] = weekRange(offset);
        return { offset, start, ...breakdown(txInWeek(transactions, offset)) };
      }),
    [transactions],
  );
  // Headroom so the value labels above the tallest bar stay inside the chart.
  const maxWeek = Math.max(settings.weeklyIncome, ...weeks.map((w) => w.total), 1) * 1.18;

  return (
    <div>
      <PageHeader title="Reportes" subtitle="¿En qué se va el dinero de la familia?" />

      <div className="space-y-4 px-5">
        <SegmentedControl
          id="report-period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "week", label: "Esta semana" },
            { value: "last", label: "Anterior" },
            { value: "month", label: "4 semanas" },
          ]}
        />

        {/* Necesidad vs Gusto */}
        <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          <h2 className="font-bold text-slate-900">Necesidad vs. Gusto</h2>
          <div className="mt-4">
            <DonutChart key={period} segments={SERIES.map((s) => ({ key: s.key, value: b[s.key], color: s.color }))}>
              <p className="text-xs font-semibold text-slate-500">Total gastado</p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{formatMXN(Math.round(b.total))}</p>
              {change !== null && (
                <p
                  className={cn(
                    "mt-0.5 flex items-center gap-0.5 text-xs font-bold",
                    change > 0 ? "text-rose-600" : "text-emerald-600",
                  )}
                >
                  {change > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {formatPct(change)} vs. anterior
                </p>
              )}
            </DonutChart>
          </div>
          <ul className="mt-5 space-y-2">
            {SERIES.map((s) => {
              const pct = b.total > 0 ? (b[s.key] / b.total) * 100 : 0;
              return (
                <li key={s.key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3.5 py-2.5">
                  <span className={cn("size-3 rounded-full", s.dot)} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                    <p className="text-[11px] text-slate-500">{s.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMXN(Math.round(b[s.key]))}</p>
                    <p className="text-[11px] font-semibold text-slate-500 tabular-nums">{Math.round(pct)}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex gap-3 rounded-2xl bg-emerald-50 p-3.5 text-sm text-emerald-900 ring-1 ring-emerald-100">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <p>{insight(b, settings.weeklyIncome, period === "month" ? 4 : 1)}</p>
          </div>
        </section>

        {/* Weekly trend */}
        <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Últimas 4 semanas</h2>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="h-0 w-4 border-t-2 border-dashed border-slate-300" /> Ingreso
            </span>
          </div>
          <div className="relative mt-5 flex h-44 gap-4">
            <div
              className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-slate-200"
              style={{ bottom: `${(settings.weeklyIncome / maxWeek) * 100}%` }}
            />
            {weeks.map((w, i) => {
              const pct = (w.total / maxWeek) * 100;
              return (
                <div key={w.offset} className="relative flex h-full flex-1 justify-center">
                  <motion.p
                    className="absolute text-[11px] font-bold whitespace-nowrap text-slate-700 tabular-nums"
                    style={{ bottom: `calc(${pct}% + 4px)` }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + 0.08 * i }}
                  >
                    {formatMXN(Math.round(w.total))}
                  </motion.p>
                  <motion.div
                    className={cn(
                      "absolute bottom-0 flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-xl",
                      w.offset === 0 && "ring-2 ring-slate-900/10 ring-offset-2",
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {SERIES.map((s) => (
                      <div
                        key={s.key}
                        style={{ height: `${w.total > 0 ? (w[s.key] / w.total) * 100 : 0}%`, background: s.color }}
                      />
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-4">
            {weeks.map((w) => (
              <p key={w.offset} className="flex-1 text-center text-[11px] font-semibold text-slate-500">
                {w.offset === 0 ? "Esta" : shortDate(w.start.toISOString())}
              </p>
            ))}
          </div>
        </section>

        {/* Top categories */}
        <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
          <h2 className="font-bold text-slate-900">Categorías principales</h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Sin gastos en este periodo.</p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {categories.map((c, i) => {
                const style = KIND_STYLE[c.kind];
                return (
                  <li key={`${c.kind}-${c.category}`} className="flex items-center gap-3">
                    <div className={cn("grid size-9 shrink-0 place-items-center rounded-xl", style.chip)}>
                      <CategoryIcon category={c.category} kind={c.kind} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{c.category}</p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMXN(Math.round(c.amount))}</p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: SERIES[c.kind === "despensa" ? 0 : c.kind === "gusto" ? 1 : 2].color,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.amount / maxCat) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.05 * i }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
