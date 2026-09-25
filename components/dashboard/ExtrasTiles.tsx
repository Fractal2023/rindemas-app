"use client";

import { ArrowLeftRight, ChevronRight, Landmark } from "lucide-react";
import Link from "next/link";
import { incomesThisMonth, occasionalExpensesThisMonth, type ExtraExpense, type ExtraIncome } from "@/lib/extras";
import { isPaidOff, remainingAmount, type Loan } from "@/lib/loans";
import { formatMXN } from "@/lib/utils";

const tile =
  "flex min-w-0 flex-col rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition hover:bg-slate-50";

/** Dashboard entries to /app/extras and /app/prestamos. */
export function ExtrasTiles({ incomes, expenses, loans }: { incomes: ExtraIncome[]; expenses: ExtraExpense[]; loans: Loan[] }) {
  const inc = incomesThisMonth(incomes);
  const exp = occasionalExpensesThisMonth(expenses);
  const active = loans.filter((l) => !isPaidOff(l));
  const owed = active.reduce((a, l) => a + remainingAmount(l), 0);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/app/extras" className={tile}>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="grid size-6 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowLeftRight className="size-3.5" />
          </span>
          Extras del mes
          <ChevronRight className="ml-auto size-3.5 text-slate-300" />
        </span>
        <span className="mt-1.5 text-sm font-bold text-emerald-600 tabular-nums">+{formatMXN(inc.total)}</span>
        <span className="text-sm font-bold text-rose-600 tabular-nums">-{formatMXN(exp.total)}</span>
      </Link>
      <Link href="/app/prestamos" className={tile}>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="grid size-6 place-items-center rounded-lg bg-sky-50 text-sky-600">
            <Landmark className="size-3.5" />
          </span>
          Préstamos
          <ChevronRight className="ml-auto size-3.5 text-slate-300" />
        </span>
        <span className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">{formatMXN(owed)}</span>
        <span className="text-[11px] text-slate-500">
          {active.length === 0 ? "Sin préstamos activos" : `${active.length} ${active.length === 1 ? "activo" : "activos"} · por pagar`}
        </span>
      </Link>
    </div>
  );
}
