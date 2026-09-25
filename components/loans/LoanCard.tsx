"use client";

import { motion } from "framer-motion";
import { CircleCheck, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { celebrate } from "@/lib/celebrate";
import {
  deleteLoan,
  dueLabel,
  installmentAmount,
  isPaidOff,
  nextDueDate,
  paidAmount,
  paidInstallments,
  payInstallment,
  paymentAlert,
  remainingAmount,
  undoLastPayment,
  type Loan,
} from "@/lib/loans";
import { planStatus } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";
import { cn, formatMXN, initials, shortDate } from "@/lib/utils";

export function LoanCard({ loan, onEdit }: { loan: Loan; onEdit: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [justPaid, setJustPaid] = useState<number | null>(null);
  const paid = paidAmount(loan);
  const remaining = remainingAmount(loan);
  const done = isPaidOff(loan);
  const cuota = installmentAmount(loan);
  const progress = loan.total > 0 ? Math.min(1, paid / loan.total) : 0;
  const unit = loan.frequency === "mensual" ? "mensual" : "quincenal";
  const { settings } = useFinanceState();
  // Payment reminders are a RindeMás PRO feature.
  const alert = planStatus(settings.plan).isPro ? paymentAlert(loan) : null;

  const pay = () => {
    const res = payInstallment(loan.id);
    if (res.paid <= 0) return;
    setJustPaid(res.paid);
    celebrate(res.paidOff);
    setTimeout(() => setJustPaid(null), 2500);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn("rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100", done && "opacity-75")}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sm font-extrabold text-sky-700">
          {initials(loan.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">{loan.name}</p>
          <p className="text-xs text-slate-500">
            {loan.installments} {loan.frequency === "mensual" ? "meses" : "quincenas"} · cuota {unit} de {formatMXN(cuota)}
          </p>
          {!done && <p className="text-xs text-slate-500">Próximo pago: {shortDate(nextDueDate(loan).toISOString())}</p>}
        </div>
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${loan.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Eliminar ${loan.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {alert && alert.level !== "ok" && (
        <p
          className={cn(
            "mt-3 rounded-2xl px-3 py-2 text-xs font-semibold",
            alert.level === "critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800",
          )}
        >
          {alert.level === "critical" ? "🔴" : "🟡"} {dueLabel(alert.daysLeft)} · {shortDate(alert.due.toISOString())}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Restante</p>
          <p className={cn("text-2xl font-extrabold tabular-nums", done ? "text-emerald-600" : "text-slate-900")}>{formatMXN(remaining)}</p>
          <p className="text-xs text-slate-400 tabular-nums">de {formatMXN(loan.total)}</p>
        </div>
        {done ? (
          <span className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-sm font-bold text-emerald-700">
            <CircleCheck className="size-4" /> Pagado
          </span>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={pay}
            className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
          >
            Registrar pago de cuota
            <span className="block text-[11px] font-semibold text-white/80">{formatMXN(Math.min(cuota, remaining))}</span>
          </motion.button>
        )}
      </div>

      {/* $ Pagado vs $ Restante */}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-rose-100">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          <span className="font-semibold text-emerald-700">Pagado {formatMXN(paid)}</span> · {paidInstallments(loan)}/{loan.installments} cuotas
        </span>
        {loan.payments.length > 0 && (
          <button type="button" onClick={() => undoLastPayment(loan.id)} className="flex items-center gap-1 font-semibold text-slate-400 hover:text-slate-600">
            <RotateCcw className="size-3" /> Deshacer último pago
          </button>
        )}
      </div>

      {justPaid !== null && (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {done ? "¡Préstamo liquidado! 🎉" : `Pago de ${formatMXN(justPaid)} registrado. Se descontó de tu disponible de la semana.`}
        </p>
      )}

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100">
          <p className="flex-1 text-xs text-rose-800">
            ¿Eliminar <b>{loan.name}</b> y sus pagos? No se puede deshacer.
          </p>
          <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => deleteLoan(loan.id)}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      )}
    </motion.li>
  );
}
