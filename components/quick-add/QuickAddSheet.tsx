"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, IceCreamCone, Minus, Plus, Receipt, ShoppingBasket, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { AmountDisplay, NumericKeypad } from "@/components/ui/NumericKeypad";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { celebrate } from "@/lib/celebrate";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { priceVariation } from "@/lib/selectors";
import { addExpense, payDebt, useFinanceState } from "@/lib/store";
import { GUSTO_CATEGORIES, PRODUCT_CATEGORIES, UNITS, type ProductCategory, type Unit } from "@/lib/types";
import { cn, formatMXN, formatPct, normalize } from "@/lib/utils";

export type QuickAddType = "despensa" | "gusto" | "abono";

const TYPES: { value: QuickAddType; label: string; icon: LucideIcon; active: string }[] = [
  { value: "despensa", label: "Despensa", icon: ShoppingBasket, active: "bg-emerald-600 text-white shadow-emerald-600/30" },
  { value: "gusto", label: "Gusto / Antojo", icon: IceCreamCone, active: "bg-amber-400 text-amber-950 shadow-amber-400/30" },
  { value: "abono", label: "Abono deuda", icon: Receipt, active: "bg-sky-500 text-white shadow-sky-500/30" },
];

const UNIT_LABEL: Record<Unit, string> = { kg: "Kg", pieza: "Pieza", litro: "Litro", paquete: "Paquete" };

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  initialType: QuickAddType;
  session: number;
}

export function QuickAddSheet({ open, onClose, initialType, session }: QuickAddSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Registro rápido" subtitle="Anota tu compra en segundos">
      <QuickAddForm key={session} initialType={initialType} active={open} onDone={onClose} />
    </Sheet>
  );
}

function QuickAddForm({ initialType, active, onDone }: { initialType: QuickAddType; active: boolean; onDone: () => void }) {
  const { products, debts } = useFinanceState();
  const payableDebts = useMemo(() => debts.filter((d) => d.direction === "debo" && d.pending > 0), [debts]);

  const [type, setType] = useState<QuickAddType>(initialType);
  const [amount, setAmount] = useState("");
  const [productName, setProductName] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [qty, setQty] = useState(1);
  const [category, setCategory] = useState<ProductCategory>("Abarrotes");
  const [gustoCat, setGustoCat] = useState<string>(GUSTO_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [debtId, setDebtId] = useState(payableDebts[0]?.id ?? "");
  const [saved, setSaved] = useState<string | null>(null);

  const value = Number(amount) || 0;
  const typedKey = normalize(productName);
  const match = typedKey ? products.find((p) => normalize(p.name) === typedKey) : undefined;
  const suggestions =
    typedKey && !match ? products.filter((p) => normalize(p.name).includes(typedKey)).slice(0, 4) : [];

  const unitPrice = qty > 0 ? value / qty : value;
  const previousPrice = match ? priceVariation(match).current : null;
  const livePct = previousPrice && value > 0 ? ((unitPrice - previousPrice) / previousPrice) * 100 : null;

  const selectedDebt = payableDebts.find((d) => d.id === debtId);
  const step = unit === "kg" || unit === "litro" ? 0.5 : 1;
  const canSave = value > 0 && (type !== "abono" || !!selectedDebt);

  const pickProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setProductName(p.name);
    setUnit(p.unit);
    setCategory(p.category);
  };

  const save = () => {
    if (!canSave || saved) return;
    if (type === "despensa") {
      const name = productName.trim();
      addExpense({
        kind: "despensa",
        amount: value,
        description: name ? `${name}${qty !== 1 ? ` · ${qty} ${unit}` : ""}` : "Despensa",
        category: name ? category : "Abarrotes",
        product: name ? { name, unit, category, quantity: qty } : undefined,
      });
      setSaved(name ? "Gasto y precio actualizados" : "Gasto registrado");
    } else if (type === "gusto") {
      addExpense({ kind: "gusto", amount: value, description: description || gustoCat, category: gustoCat });
      setSaved("Gusto registrado");
    } else if (selectedDebt) {
      const res = payDebt(selectedDebt.id, value);
      celebrate(res.settled);
      setSaved(res.settled ? "¡Deuda liquidada!" : `Abonaste ${formatMXN(res.paid)}`);
    }
    setTimeout(onDone, 950);
  };

  return (
    <div className="relative">
      {/* Type selector */}
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => {
          const isActive = t.value === type;
          return (
            <motion.button
              key={t.value}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setType(t.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-bold transition-all",
                isActive ? cn("shadow-lg", t.active) : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
            >
              <t.icon className="size-5" />
              {t.label}
            </motion.button>
          );
        })}
      </div>

      <AmountDisplay value={amount} className="py-4" />

      {/* Context fields per type */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-3 pb-4"
        >
          {type === "despensa" && (
            <>
              <div className="relative">
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Producto (opcional) · ej. Jitomate"
                  className="w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-emerald-400 placeholder:text-slate-400 focus:ring-2"
                  autoComplete="off"
                />
                {match && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    En catálogo
                  </span>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
                  {suggestions.map((p) => (
                    <Chip key={p.id} onClick={() => pickProduct(p.id)}>
                      {p.name}
                    </Chip>
                  ))}
                </div>
              )}

              {productName.trim() && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 gap-1 rounded-2xl bg-slate-100 p-1">
                      {UNITS.map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={cn(
                            "flex-1 rounded-xl py-1.5 text-xs font-bold transition",
                            unit === u ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                          )}
                        >
                          {UNIT_LABEL[u]}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
                      <button
                        type="button"
                        aria-label="Menos cantidad"
                        onClick={() => setQty((q) => Math.max(step, +(q - step).toFixed(2)))}
                        className="grid size-7 place-items-center rounded-xl bg-white text-slate-600 shadow-sm"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                      <button
                        type="button"
                        aria-label="Más cantidad"
                        onClick={() => setQty((q) => +(q + step).toFixed(2))}
                        className="grid size-7 place-items-center rounded-xl bg-white text-slate-600 shadow-sm"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {!match && (
                    <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
                      {PRODUCT_CATEGORIES.map((c) => {
                        return (
                          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                            <CategoryIcon category={c} className="size-3.5" />
                            {c}
                          </Chip>
                        );
                      })}
                    </div>
                  )}

                  {value > 0 && (
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 text-sm ring-1 ring-slate-100">
                      <span className="text-slate-500">
                        Precio por {unit}: <b className="text-slate-900 tabular-nums">{formatMXN(unitPrice)}</b>
                      </span>
                      {livePct !== null && Math.abs(livePct) >= 0.05 && (
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs font-bold",
                            livePct > 0 ? "text-rose-600" : "text-emerald-600",
                          )}
                        >
                          {livePct > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                          {formatPct(livePct)}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {type === "gusto" && (
            <>
              <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
                {GUSTO_CATEGORIES.map((c) => {
                  return (
                    <Chip key={c} active={gustoCat === c} onClick={() => setGustoCat(c)}>
                      <CategoryIcon category={c} kind="gusto" className="size-3.5" />
                      {c}
                    </Chip>
                  );
                })}
              </div>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué fue? (opcional) · ej. Tacos"
                className="w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-amber-400 placeholder:text-slate-400 focus:ring-2"
              />
            </>
          )}

          {type === "abono" &&
            (payableDebts.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                No tienes deudas pendientes. ¡Bien hecho! 🎉
              </p>
            ) : (
              <>
                <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
                  {payableDebts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDebtId(d.id)}
                      className={cn(
                        "min-w-36 shrink-0 rounded-2xl px-3.5 py-2.5 text-left transition",
                        d.id === debtId ? "bg-sky-500 text-white shadow-md shadow-sky-500/30" : "bg-slate-100 text-slate-700",
                      )}
                    >
                      <p className="truncate text-sm font-bold">{d.counterparty}</p>
                      <p className={cn("text-xs tabular-nums", d.id === debtId ? "text-sky-100" : "text-slate-500")}>
                        Debes {formatMXN(d.pending)}
                      </p>
                    </button>
                  ))}
                </div>
                {selectedDebt && (
                  <div className="flex gap-2">
                    <Chip onClick={() => setAmount(String(Math.min(500, selectedDebt.pending)))}>$500</Chip>
                    <Chip onClick={() => setAmount(String(Math.round(selectedDebt.pending / 2)))}>La mitad</Chip>
                    <Chip onClick={() => setAmount(String(selectedDebt.pending))}>Liquidar</Chip>
                  </div>
                )}
                {selectedDebt && value > selectedDebt.pending && (
                  <p className="text-xs font-semibold text-rose-600">
                    Solo se abonará lo pendiente: {formatMXN(selectedDebt.pending)}
                  </p>
                )}
              </>
            ))}
        </motion.div>
      </AnimatePresence>

      <NumericKeypad value={amount} onChange={setAmount} captureKeyboard={active && !saved} />

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={!canSave}
        onClick={save}
        className={cn(
          "mt-4 w-full rounded-2xl py-4 text-base font-bold transition",
          canSave ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" : "bg-slate-100 text-slate-400",
        )}
      >
        {canSave ? `Registrar ${formatMXN(value)}` : "Ingresa un monto"}
      </motion.button>

      {/* Success feedback */}
      <AnimatePresence>
        {saved && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="grid size-20 place-items-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 16 }}
            >
              <Check className="size-10" strokeWidth={3} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-lg font-bold text-slate-900"
            >
              {saved}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
