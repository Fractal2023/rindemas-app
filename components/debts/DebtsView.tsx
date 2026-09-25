"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ChevronDown, ChevronRight, Landmark, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useFinanceState } from "@/lib/store";
import type { DebtDirection } from "@/lib/types";
import { cn, formatMXN } from "@/lib/utils";
import { DebtCard } from "./DebtCard";
import { NewDebtSheet } from "./NewDebtSheet";
import { PaySheet } from "./PaySheet";

export function DebtsView() {
  const { debts } = useFinanceState();
  const [tab, setTab] = useState<DebtDirection>("me-deben");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [paySession, setPaySession] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [newSession, setNewSession] = useState(0);
  const [showSettled, setShowSettled] = useState(false);

  const list = debts.filter((d) => d.direction === tab);
  const active = list.filter((d) => d.pending > 0).sort((a, b) => b.pending - a.pending);
  const settled = list.filter((d) => d.pending <= 0);
  const pendingTotal = active.reduce((a, d) => a + d.pending, 0);
  const grandTotal = list.reduce((a, d) => a + d.total, 0);
  const paidTotal = grandTotal - list.reduce((a, d) => a + d.pending, 0);
  const owe = tab === "debo";

  const openPay = (id: string) => {
    setPayingId(id);
    setPaySession((n) => n + 1);
    setPayOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Deudas"
        subtitle="Préstamos, tandas y compromisos"
        action={
          <button
            onClick={() => {
              setNewSession((n) => n + 1);
              setNewOpen(true);
            }}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            <Plus className="size-4" /> Nuevo
          </button>
        }
      />

      <div className="space-y-4 px-5">
        <Link
          href="/app/suscripciones"
          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-50"
        >
          <CalendarClock className="size-4 text-emerald-600" />
          <span className="flex-1">Suscripciones y pruebas gratis</span>
          <ChevronRight className="size-4 text-slate-300" />
        </Link>
        <Link
          href="/app/prestamos"
          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-50"
        >
          <Landmark className="size-4 text-sky-600" />
          <span className="flex-1">Préstamos y compras a plazos</span>
          <ChevronRight className="size-4 text-slate-300" />
        </Link>
        <SegmentedControl
          id="debts-tab"
          value={tab}
          onChange={setTab}
          options={[
            { value: "me-deben", label: "Me deben" },
            { value: "debo", label: "Debo" },
          ]}
        />

        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-3xl p-5 text-white shadow-xl",
            owe
              ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20"
              : "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-700/30",
          )}
        >
          <div className="pointer-events-none absolute -top-14 -right-8 size-40 rounded-full bg-white/10" />
          <p className="relative text-sm text-white/75">{owe ? "Total que debes" : "Total que te deben"}</p>
          <p className="relative text-3xl font-extrabold tracking-tight tabular-nums">{formatMXN(pendingTotal)}</p>
          <p className="relative mt-1 text-xs text-white/75">
            {active.length} {active.length === 1 ? "registro activo" : "registros activos"} · {owe ? "pagado" : "cobrado"}{" "}
            {formatMXN(paidTotal)} de {formatMXN(grandTotal)}
          </p>
        </motion.section>

        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {active.map((d) => (
              <DebtCard key={d.id} debt={d} onPay={() => openPay(d.id)} />
            ))}
          </AnimatePresence>
        </ul>

        {active.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-100">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 font-semibold text-slate-700">{owe ? "¡No debes nada!" : "Nadie te debe"}</p>
            <p className="mt-1 text-sm text-slate-500">Usa “Nuevo” para registrar un préstamo, tanda o tarjeta.</p>
          </div>
        )}

        {settled.length > 0 && (
          <div>
            <button
              onClick={() => setShowSettled((s) => !s)}
              className="flex w-full items-center justify-between px-1 py-2 text-sm font-semibold text-slate-500"
            >
              Liquidadas ({settled.length})
              <ChevronDown className={cn("size-4 transition-transform", showSettled && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showSettled && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {settled.map((d) => (
                    <DebtCard key={d.id} debt={d} onPay={() => {}} />
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <PaySheet open={payOpen} debtId={payingId} session={paySession} onClose={() => setPayOpen(false)} />
      <NewDebtSheet open={newOpen} session={newSession} direction={tab} onClose={() => setNewOpen(false)} />
    </div>
  );
}
