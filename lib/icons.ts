import {
  Candy,
  Carrot,
  CreditCard,
  CupSoda,
  Drumstick,
  Egg,
  HandCoins,
  HandHeart,
  Landmark,
  type LucideIcon,
  Package,
  Receipt,
  Shirt,
  ShoppingBasket,
  Sparkles,
  SprayCan,
  Ticket,
  Tv,
  Users,
  UtensilsCrossed,
  Wallet,
  Wheat,
} from "lucide-react";
import type { DebtKind, TxKind } from "./types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Frutas y verduras": Carrot,
  "Lácteos y huevo": Egg,
  "Tortillería y pan": Wheat,
  Abarrotes: Package,
  Carnes: Drumstick,
  Bebidas: CupSoda,
  Limpieza: SprayCan,
  "Comida fuera": UtensilsCrossed,
  Antojos: Candy,
  Salidas: Ticket,
  Suscripciones: Tv,
  Ropa: Shirt,
  Otro: Sparkles,
  Deudas: Receipt,
  Cobros: HandCoins,
};

export function categoryIcon(category: string, kind?: TxKind): LucideIcon {
  return CATEGORY_ICONS[category] ?? (kind === "gusto" ? Sparkles : kind === "abono" ? Receipt : ShoppingBasket);
}

export const DEBT_KIND_ICON: Record<DebtKind, LucideIcon> = {
  tanda: Users,
  prestamo: HandHeart,
  tarjeta: CreditCard,
  fiado: Landmark,
  otro: Wallet,
};

/** Tailwind classes per transaction kind (icon chip + amount colour). */
export const KIND_STYLE: Record<TxKind, { chip: string; amount: string; label: string }> = {
  despensa: { chip: "bg-emerald-50 text-emerald-600", amount: "text-slate-900", label: "Despensa" },
  gusto: { chip: "bg-amber-50 text-amber-600", amount: "text-slate-900", label: "Gusto" },
  abono: { chip: "bg-sky-50 text-sky-600", amount: "text-slate-900", label: "Abono" },
  cobro: { chip: "bg-emerald-50 text-emerald-600", amount: "text-emerald-600", label: "Cobro" },
};
