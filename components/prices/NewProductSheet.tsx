"use client";

import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { addProduct } from "@/lib/store";
import { PRODUCT_CATEGORIES, UNITS, type ProductCategory, type Unit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NewProductSheet({ open, onClose, session }: { open: boolean; onClose: () => void; session: number }) {
  return (
    <Sheet open={open} onClose={onClose} title="Nuevo producto" subtitle="Agrégalo a tu catálogo para seguir su precio">
      <NewProductForm key={session} onClose={onClose} />
    </Sheet>
  );
}

function NewProductForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [category, setCategory] = useState<ProductCategory>("Frutas y verduras");
  const valid = name.trim().length > 1 && Number(price) > 0;

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        addProduct({ name, unit, category, price: Number(price) });
        onClose();
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre · ej. Chile serrano"
        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="Precio"
            className="w-full rounded-2xl bg-slate-100 py-3 pr-4 pl-8 text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
          {UNITS.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "rounded-xl px-2.5 text-xs font-bold capitalize transition",
                unit === u ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRODUCT_CATEGORIES.map((c) => {
          return (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              <CategoryIcon category={c} className="size-3.5" />
              {c}
            </Chip>
          );
        })}
      </div>
      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition disabled:bg-slate-100 disabled:text-slate-400"
      >
        Agregar producto
      </button>
    </form>
  );
}
