export type Unit = "kg" | "litro" | "pieza" | "paquete";

export const UNITS: Unit[] = ["kg", "pieza", "litro", "paquete"];

export const UNIT_SHORT: Record<Unit, string> = { kg: "kg", pieza: "pza", litro: "L", paquete: "paq" };

export const PRODUCT_CATEGORIES = [
  "Frutas y verduras",
  "Lácteos y huevo",
  "Tortillería y pan",
  "Abarrotes",
  "Carnes",
  "Bebidas",
  "Limpieza",
  "Higiene personal",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const GUSTO_CATEGORIES = [
  "Comida fuera",
  "Antojos",
  "Salidas",
  "Suscripciones",
  "Ropa",
  "Otro",
] as const;

export interface PricePoint {
  price: number;
  /** ISO date string */
  date: string;
}

/**
 * Purchase rhythm of a product, derived from its "despensa" transactions and
 * saved with the product (recomputed whenever purchases change).
 */
export interface ReplenishInfo {
  /** Distinct purchase days recorded. */
  purchases: number;
  lastPurchasedAt?: string;
  /** Average days between purchases. Needs at least 2 purchases. */
  avgIntervalDays?: number;
}

export interface Product {
  id: string;
  name: string;
  unit: Unit;
  category: ProductCategory;
  /** Sorted ascending by date. Last item is the current price. */
  history: PricePoint[];
  replenish?: ReplenishInfo;
}

/** Item on "la compra de hoy" (today's shopping list). */
export interface ShoppingItem {
  productId: string;
  addedAt: string;
}

/**
 * despensa: necessary household purchase
 * gusto:    discretionary spend (treat / craving)
 * abono:    payment toward a debt I owe (money out)
 * cobro:    payment received from someone who owes me (money in)
 */
export type TxKind = "despensa" | "gusto" | "abono" | "cobro";

export interface Transaction {
  id: string;
  kind: TxKind;
  amount: number;
  description: string;
  category: string;
  date: string;
  productId?: string;
  debtId?: string;
  paymentId?: string;
}

export type DebtDirection = "me-deben" | "debo";
export type DebtKind = "tanda" | "prestamo" | "tarjeta" | "fiado" | "otro";

export const DEBT_KIND_LABEL: Record<DebtKind, string> = {
  tanda: "Tanda",
  prestamo: "Préstamo",
  tarjeta: "Tarjeta",
  fiado: "Fiado",
  otro: "Otro",
};

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  kind: DebtKind;
  counterparty: string;
  concept: string;
  total: number;
  pending: number;
  createdAt: string;
  payments: DebtPayment[];
}

export type ThemeId = "esmeralda" | "neon" | "terracota" | "azul" | "morado-menta";

export type PlanTier = "free" | "pro";

export type BillingPeriod = "mensual" | "trimestral" | "semestral" | "anual";

export interface PlanState {
  tier: PlanTier;
  /** ISO date when PRO was activated. */
  startedAt?: string;
  /** ISO date when the free trial ends. Absent for a paid subscription. */
  trialEndsAt?: string;
  /** Set once the 7-day trial has been used, so it can't be restarted. */
  trialUsed?: boolean;
  /** Billing period chosen when PRO was activated. */
  billing?: BillingPeriod;
}

/** App lock. Only a salted SHA-256 hash of the PIN is stored, never the PIN itself. */
export interface SecuritySettings {
  pinHash: string;
  pinSalt: string;
}

export interface Settings {
  familyName: string;
  weeklyIncome: number;
  theme: ThemeId;
  plan: PlanState;
  security?: SecuritySettings;
  /**
   * The user accepted that, when the browser can't transcribe on the device,
   * dictation audio is processed by the browser's online speech service.
   */
  voiceCloudConsent?: boolean;
}

export interface FinanceState {
  version: 1;
  settings: Settings;
  products: Product[];
  transactions: Transaction[];
  debts: Debt[];
  shoppingList: ShoppingItem[];
}
