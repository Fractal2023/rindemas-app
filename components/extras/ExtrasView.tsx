"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  extraExpenses,
  extraIncomes,
  incomesThisMonth,
  occasionalExpensesThisMonth,
  type ExtraExpense,
  type ExtraIncome,
} from "@/lib/extras";
import { cn, formatMXN, relativeDay } from "@/lib/utils";
import { ExtraFormSheet, type ExtraKind } from "./ExtraFormSheet";

/** /app/extras — extra incomes and extra / unexpected expenses. */
export function ExtrasView() {
  const incomes = extraIncomes.useItems();
  const expenses = extraExpenses.useItems();
  const [tab, setTab] = useState<ExtraKind>("ingreso");
  const [sheet, setSheet] = useState<{ open: boolean; session: number; editing?: ExtraIncome | ExtraExpense }>({
    open: false,
    session: 0,
  });

  const openNew = () => setSheet((s) => ({ open: true, session: s.session + 1, editing: undefined }));
  const openEdit = (item: ExtraIncome | ExtraExpense) => setSheet((s) => ({ open: true, session: s.session + 1, editing: item }));

  const inc = incomesThisMonth(incomes);
  const exp = occasionalExpensesThisMonth(expenses);
  const items = [...(tab === "ingreso" ? incomes : expenses)].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        title="Extras"
        subtitle="Dinero que entra o sale fuera de lo habitual"
        action={
          <button
            onClick={openNew}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
          >
            <Plus className="size-4" /> Nuevo
          </button>
        }
      />

      <div className="space-y-4 px-5">
        <SegmentedControl
          id="extras-tab"
          value={tab}
          onChange={setTab}
          options={[
            { value: "ingreso", label: "Ingresos extra" },
            { value: "gasto", label: "Gastos extra" },
          ]}
        />

        {tab === "ingreso" ? (
          <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-xl shadow-emerald-700/25">
            <p className="text-sm text-white/80">Ingresos extra del mes</p>
            <p className="text-3xl font-extrabold tracking-tight tabular-nums">+{formatMXN(inc.total)}</p>
            <p className="mt-1 text-xs text-white/80">
              {inc.count} {inc.count === 1 ? "entrada" : "entradas"} · se suman a tu disponible de la semana en que llegan
            </p>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-rose-100">
            <p className="text-sm font-semibold text-slate-500">Gastos Ocasionales del Mes</p>
            <p className="text-3xl font-extrabold tracking-tight text-rose-600 tabular-nums">-{formatMXN(exp.total)}</p>
            {exp.byCategory.length > 0 && (
              <ul className="mt-3 space-y-2">
                {exp.byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{c.category}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatMXN(c.amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-rose-400" style={{ width: `${(c.amount / exp.total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Se restan de tu disponible, pero no se mezclan con la despensa ni con tus reportes de necesidad vs. gusto.
            </p>
          </section>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-100">
            <p className="font-semibold text-slate-700">{tab === "ingreso" ? "Sin ingresos extra todavía" : "Sin gastos extra todavía"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {tab === "ingreso"
                ? "Anota ventas, trabajos independientes, bonos o regalos con “Nuevo” o con el botón +."
                : "Anota consultas, emergencias o reparaciones con “Nuevo” o con el botón +."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <ExtraRow key={item.id} item={item} kind={tab} onEdit={() => openEdit(item)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ExtraFormSheet
        open={sheet.open}
        session={sheet.session}
        kind={tab}
        editing={sheet.editing}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}

function ExtraRow({ item, kind, onEdit }: { item: ExtraIncome | ExtraExpense; kind: ExtraKind; onEdit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const income = kind === "ingreso";
  const tag = "source" in item ? item.source : item.category;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100"
    >
      <div className="flex items-center gap-3 py-3 pr-2 pl-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-2xl",
            income ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
          )}
        >
          {income ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{item.description}</p>
          <p className="truncate text-xs text-slate-500">
            {tag} · {relativeDay(item.date)}
          </p>
        </div>
        <p className={cn("text-sm font-bold tabular-nums", income ? "text-emerald-600" : "text-rose-600")}>
          {income ? "+" : "-"}
          {formatMXN(item.amount)}
        </p>
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${item.description}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label={`Eliminar ${item.description}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {confirm && (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 ring-1 ring-rose-100">
          <p className="flex-1 text-xs text-rose-800">¿Eliminar este {income ? "ingreso" : "gasto"}?</p>
          <button type="button" onClick={() => setConfirm(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => (income ? extraIncomes.remove(item.id) : extraExpenses.remove(item.id))}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      )}
    </motion.li>
  );
}
