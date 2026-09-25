"use client";

import { AnimatePresence } from "framer-motion";
import { Crown, Landmark, Plus } from "lucide-react";
import { useState } from "react";
import { useAppActions } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { planStatus } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";
import { FREE_ACTIVE_LOANS, installmentAmount, isPaidOff, loans, paidAmount, remainingAmount, type Loan } from "@/lib/loans";
import { formatMXN } from "@/lib/utils";
import { LoanCard } from "./LoanCard";
import { LoanFormSheet } from "./LoanFormSheet";

/** /app/prestamos — installment loans and financing. */
export function LoansView() {
  const items = loans.useItems();
  const [sheet, setSheet] = useState<{ open: boolean; session: number; editing?: Loan }>({ open: false, session: 0 });
  const active = items.filter((l) => !isPaidOff(l));
  const finished = items.filter(isPaidOff);
  const remaining = active.reduce((a, l) => a + remainingAmount(l), 0);
  const paid = items.reduce((a, l) => a + paidAmount(l), 0);
  // Monthly equivalent: a quincenal installment is paid twice a month.
  const monthly = active.reduce((a, l) => a + installmentAmount(l) * (l.frequency === "quincenal" ? 2 : 1), 0);

  const { settings } = useFinanceState();
  const { openProSheet } = useAppActions();
  const isPro = planStatus(settings.plan).isPro;
  // Plan Gratuito: one active loan. Existing loans are never removed, only new ones are gated.
  const atFreeLimit = !isPro && active.length >= FREE_ACTIVE_LOANS;

  const openNew = () =>
    atFreeLimit ? openProSheet(undefined, "loans") : setSheet((s) => ({ open: true, session: s.session + 1, editing: undefined }));
  const openEdit = (loan: Loan) => setSheet((s) => ({ open: true, session: s.session + 1, editing: loan }));

  return (
    <div>
      <PageHeader
        title="Préstamos"
        subtitle="Créditos y compras a plazos"
        action={
          <button
            onClick={openNew}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
          >
            {atFreeLimit ? <Crown className="size-4" /> : <Plus className="size-4" />} Nuevo
          </button>
        }
      />

      <div className="space-y-4 px-5">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute -top-14 -right-8 size-40 rounded-full bg-white/10" />
          <p className="relative text-sm text-white/75">Te falta por pagar</p>
          <p className="relative text-3xl font-extrabold tracking-tight tabular-nums">{formatMXN(remaining)}</p>
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 px-3.5 py-2.5">
              <p className="text-[11px] text-white/70">Cuotas al mes</p>
              <p className="text-base font-bold tabular-nums">{formatMXN(monthly)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3.5 py-2.5">
              <p className="text-[11px] text-white/70">Ya pagaste</p>
              <p className="text-base font-bold tabular-nums">{formatMXN(paid)}</p>
            </div>
          </div>
        </section>

        {!isPro && (
          <button
            type="button"
            onClick={() => openProSheet(undefined, "loans")}
            className="flex w-full items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-left text-xs text-emerald-900 ring-1 ring-emerald-100"
          >
            <Crown className="size-4 shrink-0 text-emerald-600" />
            <span>
              Plan Gratuito: {FREE_ACTIVE_LOANS} préstamo activo. Con <b>RindeMás PRO</b>, préstamos ilimitados y recordatorios de
              pago.
            </span>
          </button>
        )}

        {items.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-100">
            <Landmark className="mx-auto size-8 text-emerald-600" />
            <p className="mt-3 font-semibold text-slate-800">Registra tu primer préstamo</p>
            <p className="mt-1 text-sm text-slate-500">
              Pon el total a pagar con intereses y el plazo; RindeMás calcula la cuota y lleva la cuenta de lo pagado.
            </p>
          </div>
        )}

        {active.length > 0 && (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {active.map((l) => (
                <LoanCard key={l.id} loan={l} onEdit={() => openEdit(l)} />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {finished.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-bold text-slate-500">Liquidados · {finished.length}</h2>
            <ul className="space-y-3">
              {finished.map((l) => (
                <LoanCard key={l.id} loan={l} onEdit={() => openEdit(l)} />
              ))}
            </ul>
          </section>
        )}
      </div>

      <LoanFormSheet open={sheet.open} session={sheet.session} editing={sheet.editing} onClose={() => setSheet((s) => ({ ...s, open: false }))} />
    </div>
  );
}
