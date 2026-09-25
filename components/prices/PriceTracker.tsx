"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { basketInflation, priceVariation, trendCounts, type Trend } from "@/lib/selectors";
import { useFinanceState } from "@/lib/store";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import { cn, formatPct, normalize } from "@/lib/utils";
import { NewProductSheet } from "./NewProductSheet";
import { ProductCard } from "./ProductCard";

const TREND_FILTERS: { value: Trend; label: string; icon: typeof TrendingUp; tone: string; activeTone: string }[] = [
  { value: "up", label: "Subieron", icon: TrendingUp, tone: "text-rose-600 bg-rose-50", activeTone: "bg-rose-600 text-white" },
  { value: "down", label: "Bajaron", icon: TrendingDown, tone: "text-emerald-600 bg-emerald-50", activeTone: "bg-emerald-600 text-white" },
  { value: "flat", label: "Estables", icon: Minus, tone: "text-slate-500 bg-slate-100", activeTone: "bg-slate-700 text-white" },
];

export function PriceTracker() {
  const { products } = useFinanceState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [trend, setTrend] = useState<Trend | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newSession, setNewSession] = useState(0);

  const basket = basketInflation(products);
  const counts = trendCounts(products);
  const categories = useMemo(
    () => ["Todas", ...PRODUCT_CATEGORIES.filter((c) => products.some((p) => p.category === c))],
    [products],
  );

  const q = normalize(query);
  const filtered = products
    .filter((p) => (category === "Todas" ? true : p.category === category))
    .filter((p) => (q ? normalize(p.name).includes(q) : true))
    .filter((p) => (trend ? priceVariation(p).trend === trend : true))
    .sort((a, b) => priceVariation(b).pct - priceVariation(a).pct);

  return (
    <div>
      <PageHeader
        title="Precios"
        subtitle={
          <>
            Inflación de tu canasta:{" "}
            <b className={cn(basket > 0 ? "text-rose-600" : basket < 0 ? "text-emerald-600" : "text-slate-600")}>
              {formatPct(basket)}
            </b>{" "}
            vs. registro anterior
          </>
        }
        action={
          <button
            onClick={() => {
              setNewSession((n) => n + 1);
              setNewOpen(true);
            }}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            <Plus className="size-4" /> Producto
          </button>
        }
      />

      <div className="space-y-4 px-5">
        {/* Trend summary / filter */}
        <div className="grid grid-cols-3 gap-2">
          {TREND_FILTERS.map((t) => {
            const active = trend === t.value;
            return (
              <motion.button
                key={t.value}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTrend(active ? null : t.value)}
                className={cn(
                  "rounded-2xl p-3 text-left ring-1 ring-slate-100 transition",
                  active ? t.activeTone : "bg-white shadow-[0_2px_16px_-8px_rgba(15,23,42,0.15)]",
                )}
              >
                <span className={cn("inline-grid size-7 place-items-center rounded-lg", active ? "bg-white/20" : t.tone)}>
                  <t.icon className="size-4" />
                </span>
                <p className="mt-1.5 text-xl font-extrabold tabular-nums">{counts[t.value]}</p>
                <p className={cn("text-xs font-semibold", active ? "text-white/85" : "text-slate-500")}>{t.label}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full rounded-2xl bg-white py-3 pr-10 pl-10 text-sm font-medium shadow-[0_2px_16px_-8px_rgba(15,23,42,0.15)] ring-1 ring-slate-100 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              />
            ))}
          </AnimatePresence>
        </ul>

        {filtered.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-100">
            {products.length === 0 ? (
              <>
                <p className="font-semibold text-slate-700">Aún no sigues ningún producto</p>
                <p className="mt-1 text-sm text-slate-500">
                  Se agregan solos cuando anotas una compra con el nombre del producto, o toca “+ Producto”.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-700">No encontramos productos</p>
                <p className="mt-1 text-sm text-slate-500">Prueba con otra búsqueda o agrega uno nuevo.</p>
              </>
            )}
          </div>
        )}
      </div>

      <NewProductSheet open={newOpen} session={newSession} onClose={() => setNewOpen(false)} />
    </div>
  );
}
