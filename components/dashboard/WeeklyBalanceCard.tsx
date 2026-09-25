"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Pencil } from "lucide-react";
import { useState } from "react";
import type { WeeklySummary } from "@/lib/selectors";
import { cn, formatMXN } from "@/lib/utils";

interface Props {
  summary: WeeklySummary;
  onEditIncome: () => void;
}

export function WeeklyBalanceCard({ summary, onEditIncome }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { income, received, spent, available, usage, daysLeft, despensa, gusto, abonos } = summary;
  const budget = income + received;
  const over = available < 0;
  const perDay = daysLeft > 0 ? Math.max(available, 0) / daysLeft : 0;

  const segments = [
    { label: "Despensa", value: despensa, bar: "bg-white", dot: "bg-white" },
    { label: "Gustos", value: gusto, bar: "bg-amber-300", dot: "bg-amber-300" },
    { label: "Abonos", value: abonos, bar: "bg-sky-300", dot: "bg-sky-300" },
  ];

  const tone = over
    ? "from-rose-600 to-rose-700 shadow-rose-600/30"
    : usage > 0.8
      ? "from-rose-500 to-rose-600 shadow-rose-500/30"
      : "from-emerald-600 to-teal-700 shadow-emerald-700/30";

  return (
    <motion.section
      layout
      className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-xl", tone)}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/80">{over ? "Te pasaste esta semana" : "Disponible esta semana"}</p>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
            {daysLeft === 1 ? "Último día" : `Quedan ${daysLeft} días`}
          </span>
        </div>

        <motion.p
          key={available}
          initial={{ opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums"
        >
          {formatMXN(available)}
        </motion.p>
        {budget === 0 ? (
          <button type="button" onClick={onEditIncome} className="mt-0.5 text-left text-sm text-white/90 underline-offset-2 hover:underline">
            Empieza por poner tu ingreso semanal →
          </button>
        ) : (
          !over &&
          daysLeft > 0 && (
            <p className="mt-0.5 text-sm text-white/80">
              Puedes gastar ~<b className="text-white">{formatMXN(Math.floor(perDay))}</b> por día
            </p>
          )
        )}

        {/* Progress bar: tap to see breakdown */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-5 block w-full text-left"
          aria-expanded={expanded}
        >
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-black/15">
            {segments.map((s, i) => (
              <motion.div
                key={s.label}
                className={cn("h-full", s.bar, i > 0 && "border-l border-black/10")}
                initial={{ width: 0 }}
                animate={{ width: `${budget > 0 ? Math.min((s.value / budget) * 100, 100) : 0}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 * i }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-white/85">
            <span>
              Gastado {formatMXN(spent)} · {Math.round(usage * 100)}%
            </span>
            <span className="flex items-center gap-0.5">
              Detalle
              <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid grid-cols-3 gap-2">
                {segments.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-black/10 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                      <span className={cn("size-2 rounded-full", s.dot)} />
                      {s.label}
                    </p>
                    <p className="text-sm font-bold tabular-nums">{formatMXN(s.value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEditIncome}
            className="group rounded-2xl bg-white/15 px-3.5 py-2.5 text-left transition hover:bg-white/20"
          >
            <p className="flex items-center gap-1 text-[11px] font-medium text-white/80">
              Ingreso semanal <Pencil className="size-3 opacity-70 group-hover:opacity-100" />
            </p>
            <p className="text-base font-bold tabular-nums">{formatMXN(income)}</p>
          </button>
          <div className="rounded-2xl bg-white/15 px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-white/80">{received > 0 ? "Cobros recibidos" : "Total gastado"}</p>
            <p className="text-base font-bold tabular-nums">{formatMXN(received > 0 ? received : spent)}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
