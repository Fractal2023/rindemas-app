"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { addLoan, installmentAmount, updateLoan, type Loan, type LoanFrequency } from "@/lib/loans";
import { formatMXN } from "@/lib/utils";

interface Props {
  open: boolean;
  session: number;
  editing?: Loan;
  onClose: () => void;
}

export function LoanFormSheet({ open, session, editing, onClose }: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? "Editar préstamo" : "Nuevo préstamo"}
      subtitle={editing ? editing.name : "Préstamos, créditos y compras a plazos"}
    >
      <LoanForm key={session} editing={editing} onClose={onClose} />
    </Sheet>
  );
}

const field =
  "w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400";
const label = "mb-1 block text-xs font-semibold text-slate-500";

function LoanForm({ editing, onClose }: { editing?: Loan; onClose: () => void }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [total, setTotal] = useState(editing ? String(editing.total) : "");
  const [installments, setInstallments] = useState(editing ? String(editing.installments) : "");
  const [frequency, setFrequency] = useState<LoanFrequency>(editing?.frequency ?? "mensual");
  const [dueDay, setDueDay] = useState(String(editing?.dueDay ?? new Date().getDate()));

  const totalN = Number(total);
  const count = Number(installments);
  const day = Number(dueDay);
  const valid =
    name.trim().length > 1 && totalN > 0 && Number.isInteger(count) && count >= 1 && count <= 360 && Number.isInteger(day) && day >= 1 && day <= 31;
  const perInstallment = totalN > 0 && count >= 1 ? installmentAmount({ total: totalN, installments: count }) : 0;
  const unit = frequency === "mensual" ? "mes" : "quincena";

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        const input = { name, total: totalN, installments: count, frequency, dueDay: day };
        if (editing) updateLoan(editing.id, input);
        else addLoan(input);
        onClose();
      }}
    >
      <div>
        <label htmlFor="loan-name" className={label}>
          Nombre o concepto
        </label>
        <input id="loan-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Consulta médica · Banco" className={field} />
      </div>

      <div>
        <label htmlFor="loan-total" className={label}>
          Monto total a pagar (con intereses)
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
          <input
            id="loan-total"
            value={total}
            onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0"
            className={`${field} pl-8 text-base font-bold tabular-nums`}
          />
        </div>
      </div>

      <div>
        <span className={label}>Plazo en</span>
        <SegmentedControl
          id="loan-frequency"
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: "mensual", label: "Meses" },
            { value: "quincenal", label: "Quincenas" },
          ]}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="loan-installments" className={label}>
            Número de {frequency === "mensual" ? "meses" : "quincenas"}
          </label>
          <input
            id="loan-installments"
            value={installments}
            onChange={(e) => setInstallments(e.target.value.replace(/\D/g, "").slice(0, 3))}
            inputMode="numeric"
            placeholder="12"
            className={`${field} tabular-nums`}
          />
        </div>
        <div className="w-32">
          <label htmlFor="loan-day" className={label}>
            Día límite de pago
          </label>
          <input
            id="loan-day"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            className={`${field} tabular-nums`}
          />
        </div>
      </div>
      {frequency === "quincenal" && day >= 1 && day <= 31 && (
        <p className="-mt-2 text-xs text-slate-500">Se paga el día {day} y 15 días después.</p>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
        <span className="text-sm text-emerald-900">Cuota por {unit}</span>
        <span className="text-lg font-extrabold text-emerald-700 tabular-nums">{perInstallment > 0 ? formatMXN(perInstallment) : "—"}</span>
      </div>
      {editing && editing.payments.length > 0 && (
        <p className="-mt-2 text-xs text-slate-500">
          {editing.payments.length === 1
            ? "El pago que ya registraste se conserva."
            : `Los ${editing.payments.length} pagos que ya registraste se conservan.`}
        </p>
      )}

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {editing ? "Guardar cambios" : "Guardar préstamo"}
      </button>
    </form>
  );
}
