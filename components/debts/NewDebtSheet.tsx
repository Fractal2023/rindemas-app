"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { DEBT_KIND_ICON } from "@/lib/icons";
import { addDebt } from "@/lib/store";
import { DEBT_KIND_LABEL, type DebtDirection, type DebtKind } from "@/lib/types";

interface Props {
  open: boolean;
  session: number;
  direction: DebtDirection;
  onClose: () => void;
}

export function NewDebtSheet({ open, session, direction, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Nuevo registro" subtitle="Préstamos, tandas, tarjetas y fiados">
      <NewDebtForm key={session} initialDirection={direction} onClose={onClose} />
    </Sheet>
  );
}

function NewDebtForm({ initialDirection, onClose }: { initialDirection: DebtDirection; onClose: () => void }) {
  const [direction, setDirection] = useState<DebtDirection>(initialDirection);
  const [kind, setKind] = useState<DebtKind>("prestamo");
  const [counterparty, setCounterparty] = useState("");
  const [concept, setConcept] = useState("");
  const [total, setTotal] = useState("");
  const valid = counterparty.trim().length > 1 && Number(total) > 0;

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        addDebt({ direction, kind, counterparty, concept: concept || DEBT_KIND_LABEL[kind], total: Number(total) });
        onClose();
      }}
    >
      <SegmentedControl
        id="new-debt-dir"
        value={direction}
        onChange={setDirection}
        options={[
          { value: "me-deben", label: "Me deben" },
          { value: "debo", label: "Debo" },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DEBT_KIND_LABEL) as DebtKind[]).map((k) => {
          const Icon = DEBT_KIND_ICON[k];
          return (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              <Icon className="size-3.5" />
              {DEBT_KIND_LABEL[k]}
            </Chip>
          );
        })}
      </div>
      <input
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        placeholder={direction === "debo" ? "¿A quién le debes? · ej. Tarjeta Elektra" : "¿Quién te debe? · ej. Primo Juan"}
        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <input
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        placeholder="Concepto (opcional)"
        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <div className="relative">
        <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
        <input
          value={total}
          onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder="Monto total"
          className="w-full rounded-2xl bg-slate-100 py-3 pr-4 pl-8 text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition disabled:bg-slate-100 disabled:text-slate-400"
      >
        Guardar
      </button>
    </form>
  );
}
