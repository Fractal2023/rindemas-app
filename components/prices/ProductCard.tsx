"use client";

import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Pencil, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { frequencyLabel, runOutLabel, stockStatus } from "@/lib/replenishment";
import { priceVariation } from "@/lib/selectors";
import { planStatus } from "@/lib/plan";
import { deleteProduct, recordPrice, useFinanceState } from "@/lib/store";
import { UNIT_SHORT, type Product } from "@/lib/types";
import { cn, formatMXN, relativeDay, shortDate } from "@/lib/utils";
import { EditProductSheet } from "./EditProductSheet";
import { Sparkline } from "./Sparkline";

const TREND_COLOR = { up: "var(--color-rose-600)", down: "var(--color-emerald-600)", flat: "var(--color-slate-400)" };
const TREND_CHIP = {
  up: "bg-rose-50 text-rose-600",
  down: "bg-emerald-50 text-emerald-600",
  flat: "bg-slate-100 text-slate-500",
};

/** Consumption label color by stock status. */
const STOCK_STYLE = {
  ok: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-600",
  unknown: "bg-slate-100 text-slate-500",
};

export function ProductCard({ product, expanded, onToggle }: { product: Product; expanded: boolean; onToggle: () => void }) {
  const v = priceVariation(product);
  const { settings } = useFinanceState();
  // Purchase-rhythm predictions are a RindeMás PRO feature.
  const stock = planStatus(settings.plan).isPro ? stockStatus(product.replenish) : { status: "unknown" as const };
  const [newPrice, setNewPrice] = useState("");
  const [edit, setEdit] = useState({ open: false, session: 0 });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const parsed = Number(newPrice);

  const submit = () => {
    if (!(parsed > 0)) return;
    recordPrice(product.id, parsed);
    setNewPrice("");
  };

  return (
    <motion.li
      layout
      className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100"
    >
      <div className="flex items-stretch">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 py-4 pl-4 text-left" aria-expanded={expanded}>
          <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", TREND_CHIP[v.trend])}>
            <CategoryIcon category={product.category} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 leading-snug font-semibold text-slate-900">{product.name}</p>
            <p className="truncate text-xs text-slate-500">
              {product.category} · {relativeDay(v.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-extrabold text-slate-900 tabular-nums">
              {formatMXN(v.current)}
              <span className="font-medium text-slate-400">/{UNIT_SHORT[product.unit]}</span>
            </p>
            <PriceBadge trend={v.trend} pct={v.pct} />
          </div>
          <ChevronDown className={cn("size-4 shrink-0 text-slate-300 transition-transform", expanded && "rotate-180")} />
        </button>
        {/* Always-visible actions */}
        <div className="flex shrink-0 flex-col justify-center gap-1 py-2 pr-2 pl-1">
          <button
            type="button"
            onClick={() => setEdit((e) => ({ open: true, session: e.session + 1 }))}
            aria-label={`Editar ${product.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Eliminar ${product.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100">
          <p className="flex-1 text-xs text-rose-800">
            ¿Eliminar <b>{product.name}</b> del tracker? Tus compras pasadas se conservan.
          </p>
          <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => deleteProduct(product.id)}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      )}

      {stock.avgIntervalDays && (
        <p
          className={cn(
            "-mt-2 mb-3 ml-[4.5rem] inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
            STOCK_STYLE[stock.status],
          )}
        >
          <Repeat className="size-3 shrink-0" />
          {frequencyLabel(stock.avgIntervalDays)}
        </p>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-slate-100 px-4 pt-3 pb-4">
              {v.previous != null && (
                <p className="text-sm text-slate-600">
                  {v.trend === "flat"
                    ? "El precio se mantiene igual que en el registro anterior."
                    : `${v.trend === "up" ? "Subió" : "Bajó"} ${formatMXN(Math.abs(v.delta))} por ${product.unit} respecto al registro anterior (${formatMXN(v.previous)}).`}
                </p>
              )}
              {stock.nextDate && stock.daysLeft !== undefined && (
                <p className="text-sm text-slate-600">
                  <b className="text-slate-800">{runOutLabel(stock.daysLeft)}.</b> Próxima compra estimada:{" "}
                  {shortDate(stock.nextDate.toISOString())} ({product.replenish?.purchases} compras registradas).
                </p>
              )}
              <Sparkline history={product.history.slice(-8)} color={TREND_COLOR[v.trend]} />
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {[...product.history].reverse().slice(0, 6).map((p, i) => (
                  <div key={`${p.date}-${i}`} className="shrink-0 rounded-xl bg-slate-50 px-2.5 py-1.5 text-center">
                    <p className="text-[10px] font-medium text-slate-400">{shortDate(p.date)}</p>
                    <p className="text-xs font-bold text-slate-700 tabular-nums">{formatMXN(p.price)}</p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="relative flex-1">
                  <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                  <input
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                    placeholder={`Nuevo precio por ${product.unit}`}
                    className="w-full rounded-2xl bg-slate-100 py-2.5 pr-3 pl-7 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!(parsed > 0)}
                  className="rounded-2xl bg-emerald-600 px-4 text-sm font-bold text-white transition disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Actualizar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <EditProductSheet
        product={product}
        open={edit.open}
        session={edit.session}
        onClose={() => setEdit((e) => ({ ...e, open: false }))}
      />
    </motion.li>
  );
}
