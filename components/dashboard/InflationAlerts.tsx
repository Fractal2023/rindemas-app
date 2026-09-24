"use client";

import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { motion } from "framer-motion";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { basketInflation, topPriceAlerts } from "@/lib/selectors";
import { UNIT_SHORT, type Product } from "@/lib/types";
import { cn, formatMXN, formatPct } from "@/lib/utils";

export function InflationAlerts({ products }: { products: Product[] }) {
  const alerts = topPriceAlerts(products, 3);
  const basket = basketInflation(products);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-rose-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-rose-100 text-rose-600">
            <TriangleAlert className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Alertas de precios</h2>
            <p className="text-xs text-slate-500">
              Tu canasta{" "}
              <b className={cn(basket > 0 ? "text-rose-600" : basket < 0 ? "text-emerald-600" : "text-slate-600")}>
                {basket === 0 ? "sin cambios" : `${formatPct(basket)} esta semana`}
              </b>
            </p>
          </div>
        </div>
        <Link
          href="/app/precios"
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap text-rose-600 hover:bg-rose-50"
        >
          Ver todo <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Sin cambios de precio esta semana. Registra tus compras para detectar variaciones.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {alerts.map(({ product, v }, i) => {
            return (
              <motion.li
                key={product.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5"
              >
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl",
                    v.trend === "up" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600",
                  )}
                >
                  <CategoryIcon category={product.category} className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    <span className="line-through decoration-slate-300">{formatMXN(v.previous ?? 0)}</span> →{" "}
                    <b className="text-slate-700">{formatMXN(v.current)}</b> / {UNIT_SHORT[product.unit]}
                  </p>
                </div>
                <PriceBadge trend={v.trend} pct={v.pct} />
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
