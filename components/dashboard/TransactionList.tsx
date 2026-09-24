"use client";

import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { KIND_STYLE } from "@/lib/icons";
import { deleteTransaction } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { cn, formatMXN, relativeDay, timeOfDay } from "@/lib/utils";

/** Transaction rows; tapping a row reveals a delete action. */
export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-slate-100">
      <AnimatePresence initial={false}>
        {transactions.map((t) => {
          const style = KIND_STYLE[t.kind];
          const isOpen = openId === t.id;
          return (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : t.id)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", style.chip)}>
                  <CategoryIcon category={t.category} kind={t.kind} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.description}</p>
                  <p className="truncate text-xs text-slate-500">
                    {t.category} · {relativeDay(t.date)}, {timeOfDay(t.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-bold tabular-nums", style.amount)}>
                    {t.kind === "cobro" ? "+" : "-"}
                    {formatMXN(t.amount)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">{style.label}</p>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex justify-end gap-2 pb-3">
                      <button
                        onClick={() => setOpenId(null)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          deleteTransaction(t.id);
                          setOpenId(null);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar{t.debtId ? " y revertir abono" : ""}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
