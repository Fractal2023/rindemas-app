"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import {
  addExtraExpense,
  addExtraIncome,
  EXTRA_EXPENSE_CATEGORIES,
  EXTRA_INCOME_SOURCES,
  updateExtraExpense,
  updateExtraIncome,
  type ExtraExpense,
  type ExtraExpenseCategory,
  type ExtraIncome,
  type ExtraIncomeSource,
} from "@/lib/extras";
import { toYmd, parseLocalDate } from "@/lib/subscriptions";

export type ExtraKind = "ingreso" | "gasto";

interface Props {
  open: boolean;
  session: number;
  kind: ExtraKind;
  /** Item being edited; omit to create a new one. */
  editing?: ExtraIncome | ExtraExpense;
  onClose: () => void;
}

export function ExtraFormSheet({ open, session, kind, editing, onClose }: Props) {
  const title = `${editing ? "Editar" : "Nuevo"} ${kind === "ingreso" ? "ingreso extra" : "gasto extra"}`;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={kind === "ingreso" ? "Ventas, trabajos, bonos, regalos…" : "Salud, emergencias, reparaciones…"}
    >
      <ExtraForm key={session} kind={kind} editing={editing} onClose={onClose} />
    </Sheet>
  );
}

function ExtraForm({ kind, editing, onClose }: { kind: ExtraKind; editing?: ExtraIncome | ExtraExpense; onClose: () => void }) {
  const options: readonly string[] = kind === "ingreso" ? EXTRA_INCOME_SOURCES : EXTRA_EXPENSE_CATEGORIES;
  const initialTag = editing ? ("source" in editing ? editing.source : editing.category) : options[0];
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [tag, setTag] = useState<string>(initialTag);
  const [description, setDescription] = useState(editing?.description ?? "");
  const [date, setDate] = useState(toYmd(editing ? new Date(editing.date) : new Date()));
  const valid = Number(amount) > 0 && !!date;

  const submit = () => {
    if (!valid) return;
    // Keep the original time when the day didn't change; otherwise noon of the chosen day.
    const iso =
      editing && toYmd(new Date(editing.date)) === date
        ? editing.date
        : new Date(parseLocalDate(date).getTime() + 12 * 3_600_000).toISOString();
    if (kind === "ingreso") {
      const input = { amount: Number(amount), source: tag as ExtraIncomeSource, description, date: iso };
      if (editing) updateExtraIncome(editing.id, input);
      else addExtraIncome(input);
    } else {
      const input = { amount: Number(amount), category: tag as ExtraExpenseCategory, description, date: iso };
      if (editing) updateExtraExpense(editing.id, input);
      else addExtraExpense(input);
    }
    onClose();
  };

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <label htmlFor="extra-amount" className="mb-1 block text-xs font-semibold text-slate-500">
          Monto (MXN)
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
          <input
            id="extra-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0"
            className="w-full rounded-2xl bg-slate-100 py-3 pr-4 pl-8 text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">{kind === "ingreso" ? "Tipo de ingreso" : "Categoría"}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <Chip key={o} active={tag === o} onClick={() => setTag(o)}>
              {o}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="extra-description" className="mb-1 block text-xs font-semibold text-slate-500">
          Descripción (opcional)
        </label>
        <input
          id="extra-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={kind === "ingreso" ? "ej. Venta de tamales" : "ej. Consulta médica"}
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label htmlFor="extra-date" className="mb-1 block text-xs font-semibold text-slate-500">
          Fecha
        </label>
        <input
          id="extra-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {editing ? "Guardar cambios" : "Guardar"}
      </button>
    </form>
  );
}
