"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { celebrate } from "@/lib/celebrate";
import { dueLabel, installmentAmount, payInstallment, remainingAmount, upcomingLoanPayments, type Loan } from "@/lib/loans";
import { cn, formatMXN, shortDate } from "@/lib/utils";

/** PRO: in-app reminder on the dashboard for loan payments due in 3 days or less. */
export function UpcomingPaymentsCard({ loans }: { loans: Loan[] }) {
  const upcoming = upcomingLoanPayments(loans);
  const [paidId, setPaidId] = useState<string | null>(null);
  if (upcoming.length === 0 && !paidId) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-rose-100">
      <div className="flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-2xl bg-rose-100 text-rose-600">
          <BellRing className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900">Próximos pagos</h2>
          <p className="text-xs text-slate-500">Préstamos que vencen en 3 días o menos</p>
        </div>
        <Link href="/app/prestamos" className="text-xs font-bold text-emerald-700">
          Ver todos
        </Link>
      </div>
      {paidId && upcoming.every((u) => u.loan.id !== paidId) && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Pago registrado. Se descontó de tu disponible de la semana.
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {upcoming.map(({ loan, alert }) => (
          <li key={loan.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{loan.name}</p>
              <p className={cn("text-xs font-semibold", alert.level === "critical" ? "text-rose-600" : "text-amber-600")}>
                {dueLabel(alert.daysLeft)} · {shortDate(alert.due.toISOString())}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const res = payInstallment(loan.id);
                if (res.paid > 0) {
                  setPaidId(loan.id);
                  celebrate(res.paidOff);
                }
              }}
              className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Pagar {formatMXN(Math.min(installmentAmount(loan), remainingAmount(loan)))}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
