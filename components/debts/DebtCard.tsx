"use client";

import { motion } from "framer-motion";
import { CircleCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { DEBT_KIND_ICON } from "@/lib/icons";
import { deleteDebt } from "@/lib/store";
import { DEBT_KIND_LABEL, type Debt } from "@/lib/types";
import { cn, formatMXN, initials, shortDate } from "@/lib/utils";

export function DebtCard({ debt, onPay }: { debt: Debt; onPay: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const paid = debt.total - debt.pending;
  const progress = debt.total > 0 ? paid / debt.total : 0;
  const settled = debt.pending <= 0;
  const owe = debt.direction === "debo";
  const KindIcon = DEBT_KIND_ICON[debt.kind];
  const lastPayment = debt.payments[debt.payments.length - 1];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100",
        settled && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold",
            owe ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700",
          )}
        >
          {initials(debt.counterparty)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-slate-900">{debt.counterparty}</p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
              <KindIcon className="size-3" />
              {DEBT_KIND_LABEL[debt.kind]}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{debt.concept}</p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Pendiente</p>
          <p className={cn("text-2xl font-extrabold tabular-nums", settled ? "text-emerald-600" : "text-slate-900")}>
            {formatMXN(debt.pending)}
          </p>
          <p className="text-xs text-slate-400 tabular-nums">de {formatMXN(debt.total)}</p>
        </div>
        {settled ? (
          <span className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-sm font-bold text-emerald-700">
            <CircleCheck className="size-4" /> Liquidada
          </span>
        ) : (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onPay}
            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700"
          >
            Abonar
          </motion.button>
        )}
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={cn("h-full rounded-full", owe ? "bg-gradient-to-r from-sky-400 to-sky-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500")}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {Math.round(progress * 100)}% {owe ? "pagado" : "cobrado"}
          {lastPayment && ` · último abono ${shortDate(lastPayment.date)}`}
        </span>
        {confirmDelete ? (
          <span className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="font-semibold text-slate-500">
              No
            </button>
            <button onClick={() => deleteDebt(debt.id)} className="font-bold text-rose-600">
              Sí, eliminar
            </button>
          </span>
        ) : (
          <button onClick={() => setConfirmDelete(true)} aria-label="Eliminar" className="p-1 text-slate-300 hover:text-rose-600">
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </motion.li>
  );
}
