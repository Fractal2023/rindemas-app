"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Plus, ShoppingCart, X } from "lucide-react";
import { useAppActions } from "@/components/layout/AppShell";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { runningLow, runOutLabel } from "@/lib/replenishment";
import { planStatus } from "@/lib/plan";
import { addToShoppingList, removeFromShoppingList, useFinanceState } from "@/lib/store";
import type { Product, ShoppingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Icon chip color: red when it already ran out (critical), yellow when it's close (warning). */
const STATUS_STYLE = {
  critical: { chip: "bg-rose-100 text-rose-600" },
  warning: { chip: "bg-amber-100 text-amber-600" },
} as const;

interface Props {
  products: Product[];
  shoppingList: ShoppingItem[];
}

/** Dashboard card: products predicted to run out soon + today's shopping list. PRO only. */
export function RunningLowCard(props: Props) {
  const { settings } = useFinanceState();
  return planStatus(settings.plan).isPro ? <RunningLowPro {...props} /> : <RunningLowTeaser products={props.products} />;
}

/** Plan Gratuito: shows how many products the model would flag, without revealing which. */
function RunningLowTeaser({ products }: { products: Product[] }) {
  const { openProSheet } = useAppActions();
  const count = runningLow(products).length;
  if (count === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
      <div className="flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <ShoppingCart className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 font-bold text-slate-900">
            Por terminarse esta semana
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <Crown className="size-2.5" /> PRO
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {count} {count === 1 ? "producto podría acabarse" : "productos podrían acabarse"} pronto
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 blur-[3px] select-none" aria-hidden>
        {["bg-rose-100", "bg-amber-100"].map((bg, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
            <span className={cn("size-9 rounded-xl", bg)} />
            <span className="h-3 flex-1 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        RindeMás aprende cada cuánto compras cada producto y te avisa antes de que se acabe, con tu lista de compra lista.
      </p>
      <button
        type="button"
        onClick={() => openProSheet(undefined, "replenishment")}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
      >
        <Crown className="size-4" /> Ver qué se me va a acabar
      </button>
    </section>
  );
}

function RunningLowPro({ products, shoppingList }: Props) {
  const { openQuickAdd } = useAppActions();
  const low = runningLow(products);
  const onList = new Set(shoppingList.map((i) => i.productId));
  const pending = low.filter(({ product }) => !onList.has(product.id));
  const listProducts = shoppingList
    .map((i) => products.find((p) => p.id === i.productId))
    .filter((p): p is Product => !!p);

  if (low.length === 0 && listProducts.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-amber-100">
      <div className="flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <ShoppingCart className="size-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Por terminarse esta semana</h2>
          <p className="text-xs text-slate-500">Según cada cuánto los compras</p>
        </div>
      </div>

      {low.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {low.map(({ product, prediction }, i) => {
            const status = prediction.status as keyof typeof STATUS_STYLE;
            const style = STATUS_STYLE[status];
            const added = onList.has(product.id);
            return (
              <motion.li
                key={product.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5"
              >
                <div className={cn("grid size-9 shrink-0 place-items-center rounded-xl", style.chip)}>
                  <CategoryIcon category={product.category} className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    <span className={cn("font-semibold", status === "critical" ? "text-rose-600" : "text-amber-600")}>
                      {runOutLabel(prediction.daysLeft ?? 0)}
                    </span>
                    {prediction.avgIntervalDays && ` · cada ${Math.round(prediction.avgIntervalDays)} días`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (added ? removeFromShoppingList(product.id) : addToShoppingList([product.id]))}
                  aria-label={added ? `Quitar ${product.name} de la compra de hoy` : `Agregar ${product.name} a la compra de hoy`}
                  aria-pressed={added}
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition",
                    added ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
                  )}
                >
                  {added ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={2.5} />}
                </button>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Nada por terminarse esta semana.</p>
      )}

      {pending.length > 0 && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => addToShoppingList(pending.map(({ product }) => product.id))}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Agregar a la compra de hoy
        </motion.button>
      )}

      <AnimatePresence initial={false}>
        {listProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500">
                Tu compra de hoy · {listProducts.length} {listProducts.length === 1 ? "producto" : "productos"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Toca uno para anotar la compra; se tacha solo.</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {listProducts.map((p) => (
                  <li key={p.id} className="flex items-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                    <button
                      type="button"
                      onClick={() => openQuickAdd("despensa", p.id)}
                      className="py-1.5 pr-1 pl-3 text-xs font-semibold text-emerald-700"
                    >
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromShoppingList(p.id)}
                      aria-label={`Quitar ${p.name} de la compra de hoy`}
                      className="grid size-7 place-items-center rounded-full text-emerald-600 hover:bg-emerald-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
