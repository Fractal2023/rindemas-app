"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { AmountDisplay, NumericKeypad } from "@/components/ui/NumericKeypad";
import { Sheet } from "@/components/ui/Sheet";
import { celebrate } from "@/lib/celebrate";
import { payDebt, useFinanceState } from "@/lib/store";
import { cn, formatMXN } from "@/lib/utils";

interface PaySheetProps {
  open: boolean;
  /** Stays set after closing so the content remains visible during the exit animation. */
  debtId: string | null;
  session: number;
  onClose: () => void;
}

export function PaySheet({ open, debtId, session, onClose }: PaySheetProps) {
  const { debts } = useFinanceState();
  const debt = debts.find((d) => d.id === debtId);

  return (
    <Sheet
      open={open && !!debt}
      onClose={onClose}
      title={debt?.direction === "debo" ? "Registrar abono" : "Registrar cobro"}
      subtitle={debt ? `${debt.counterparty} · ${debt.concept}` : undefined}
    >
      {debt && <PayForm key={session} debtId={debt.id} onClose={onClose} />}
    </Sheet>
  );
}

function PayForm({ debtId, onClose }: { debtId: string; onClose: () => void }) {
  const { debts } = useFinanceState();
  const debt = debts.find((d) => d.id === debtId)!;
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState<{ paid: number; settled: boolean; remaining: number } | null>(null);
  const value = Number(amount) || 0;
  const owe = debt.direction === "debo";

  const submit = () => {
    if (value <= 0 || done) return;
    const res = payDebt(debt.id, value);
    celebrate(res.settled);
    setDone({ ...res, remaining: Math.max(debt.pending - res.paid, 0) });
    setTimeout(onClose, res.settled ? 1900 : 1400);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
        <span className="text-sm text-slate-500">Saldo pendiente</span>
        <span className="font-extrabold text-slate-900 tabular-nums">{formatMXN(debt.pending)}</span>
      </div>

      <AmountDisplay value={amount} className="py-5" />

      <div className="mb-4 flex justify-center gap-2">
        {debt.kind === "tanda" && <Chip onClick={() => setAmount(String(Math.min(500, debt.pending)))}>Mi número $500</Chip>}
        <Chip onClick={() => setAmount(String(Math.round(debt.pending / 2)))}>La mitad</Chip>
        <Chip onClick={() => setAmount(String(debt.pending))}>{owe ? "Liquidar" : "Todo"}</Chip>
      </div>

      {value > debt.pending && (
        <p className="-mt-2 mb-3 text-center text-xs font-semibold text-rose-600">
          Solo se aplicará lo pendiente: {formatMXN(debt.pending)}
        </p>
      )}

      <NumericKeypad value={amount} onChange={setAmount} captureKeyboard={!done} />

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={value <= 0}
        onClick={submit}
        className={cn(
          "mt-4 w-full rounded-2xl py-4 font-bold transition",
          value > 0
            ? owe
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
              : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
            : "bg-slate-100 text-slate-400",
        )}
      >
        {value > 0 ? `${owe ? "Abonar" : "Recibí"} ${formatMXN(Math.min(value, debt.pending))}` : "Ingresa un monto"}
      </motion.button>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/95 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className="grid size-20 place-items-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40"
            >
              <PartyPopper className="size-9" />
            </motion.div>
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {done.settled ? (owe ? "¡Deuda liquidada!" : "¡Cobrado completo!") : "¡Abono registrado!"}
            </p>
            <p className="text-sm text-slate-500">
              {done.settled
                ? "Un compromiso menos. ¡Excelente!"
                : `${formatMXN(done.paid)} aplicados · quedan ${formatMXN(done.remaining)}`}
            </p>
            <p className="text-xs font-semibold text-emerald-600">
              {owe ? "Se descontó de tu disponible semanal" : "Se sumó a tu disponible semanal"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
