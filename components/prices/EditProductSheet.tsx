"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { updateProduct } from "@/lib/store";
import { PRODUCT_CATEGORIES, UNITS, type Product, type ProductCategory, type Unit } from "@/lib/types";
import { cn, formatMXN, shortDate } from "@/lib/utils";

interface Props {
  product: Product;
  open: boolean;
  session: number;
  onClose: () => void;
}

/** Fix a product's name, unit, category or its latest captured price. */
export function EditProductSheet({ product, open, session, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Editar producto" subtitle="Corrige un error de captura">
      <EditProductForm key={session} product={product} onClose={onClose} />
    </Sheet>
  );
}

function EditProductForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const last = product.history[product.history.length - 1];
  const [name, setName] = useState(product.name);
  const [unit, setUnit] = useState<Unit>(product.unit);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [price, setPrice] = useState(last ? String(last.price) : "");
  const valid = name.trim().length > 1 && (price === "" || Number(price) > 0);

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        updateProduct(product.id, { name, unit, category, price: price === "" ? undefined : Number(price) });
        onClose();
      }}
    >
      <div>
        <label htmlFor="edit-product-name" className="mb-1 block text-xs font-semibold text-slate-500">
          Nombre
        </label>
        <input
          id="edit-product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label htmlFor="edit-product-price" className="mb-1 block text-xs font-semibold text-slate-500">
          Precio por {unit} {last && <span className="font-normal">· corrige el registro del {shortDate(last.date)}</span>}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
            <input
              id="edit-product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className="w-full rounded-2xl bg-slate-100 py-3 pr-4 pl-8 text-base font-bold tabular-nums outline-none focus:ring-2 focus:ring-emerald-400"
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
        {last && Number(price) > 0 && Number(price) !== last.price && (
          <p className="mt-1 text-xs text-slate-500">
            {formatMXN(last.price)} → <b className="text-slate-800">{formatMXN(Number(price))}</b>. Para registrar un precio nuevo
            (no una corrección) usa “Actualizar” en la tarjeta.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            <CategoryIcon category={c} className="size-3.5" />
            {c}
          </Chip>
        ))}
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
      >
        Guardar cambios
      </button>
    </form>
  );
}
