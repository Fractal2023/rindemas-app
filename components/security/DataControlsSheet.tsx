"use client";

import { Download, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { exportDataJson, useFinanceState, wipeAllData } from "@/lib/store";
import { cn } from "@/lib/utils";

const CONFIRM_WORD = "ELIMINAR";

interface Props {
  open: boolean;
  session: number;
  onClose: () => void;
  /** Called after the data was wiped (e.g. to close the Ajustes sheet as well). */
  onWiped: () => void;
}

export function DataControlsSheet({ open, session, onClose, onWiped }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Tus datos" subtitle="Descarga un respaldo o bórralos para siempre">
      <DataControls key={session} onWiped={onWiped} />
    </Sheet>
  );
}

function downloadBackup() {
  const blob = new Blob([exportDataJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rindemas-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DataControls({ onWiped }: { onWiped: () => void }) {
  const { transactions, debts, products } = useFinanceState();
  const [exported, setExported] = useState(false);
  const [confirm, setConfirm] = useState("");
  const canDelete = confirm.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <div className="space-y-4 pb-2">
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-sm font-bold text-slate-900">Exportar mis datos</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Un archivo JSON con {transactions.length} movimientos, {debts.length} deudas y {products.length} productos.
        </p>
        <button
          onClick={() => {
            downloadBackup();
            setExported(true);
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Download className="size-4" />
          {exported ? "Descargado · volver a descargar" : "Descargar respaldo"}
        </button>
      </div>

      <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
        <p className="flex items-center gap-1.5 text-sm font-bold text-rose-700">
          <TriangleAlert className="size-4" /> Eliminar definitivamente
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Se borran todos tus gastos, precios, deudas, ajustes y tu PIN de este dispositivo. No se puede deshacer. Te recomendamos
          descargar un respaldo antes.
        </p>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-slate-600">
            Escribe <b className="text-rose-700">{CONFIRM_WORD}</b> para confirmar
          </span>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold tracking-wider uppercase ring-1 ring-rose-200 outline-none focus:ring-2 focus:ring-rose-600"
          />
        </label>
        <button
          disabled={!canDelete}
          onClick={() => {
            wipeAllData();
            onWiped();
          }}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition",
            canDelete ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-rose-100 text-rose-300",
          )}
        >
          <Trash2 className="size-4" /> Eliminar todos mis datos
        </button>
      </div>
    </div>
  );
}
