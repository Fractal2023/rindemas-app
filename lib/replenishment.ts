import type { Product, ReplenishInfo, Transaction } from "./types";
import { normalize } from "./utils";

/**
 * Smart replenishment: learns how often each product is bought and predicts
 * when it's about to run out. Pure functions — works offline on local data.
 */

export type StockStatus = "ok" | "warning" | "critical" | "unknown";

/** A product is "warning" when it should run out in fewer than this many days. */
export const WARNING_DAYS = 3;

const DAY_MS = 86_400_000;

function dayStart(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Purchases of a product, by product id or (for older records) by name. */
function purchasesOf(product: Product, transactions: Transaction[]) {
  const name = normalize(product.name);
  return transactions.filter(
    (t) => t.kind === "despensa" && (t.productId ? t.productId === product.id : normalize(t.description).startsWith(name)),
  );
}

/** Average days between purchases, counting each calendar day once. */
export function averageIntervalDays(dates: string[]): number | undefined {
  const days = [...new Set(dates.map(dayStart))].sort((a, b) => a - b);
  if (days.length < 2) return undefined;
  const span = (days[days.length - 1] - days[0]) / DAY_MS;
  return Math.max(1, Math.round((span / (days.length - 1)) * 10) / 10);
}

export function computeReplenish(product: Product, transactions: Transaction[]): ReplenishInfo {
  const dates = purchasesOf(product, transactions).map((t) => t.date);
  if (dates.length === 0) return { purchases: 0 };
  const last = dates.reduce((a, b) => (a > b ? a : b));
  return {
    purchases: new Set(dates.map(dayStart)).size,
    lastPurchasedAt: last,
    avgIntervalDays: averageIntervalDays(dates),
  };
}

/** Recomputes the purchase rhythm of every product. Call after purchases change. */
export function withReplenishment(products: Product[], transactions: Transaction[]): Product[] {
  return products.map((p) => ({ ...p, replenish: computeReplenish(p, transactions) }));
}

export interface StockPrediction {
  status: StockStatus;
  avgIntervalDays?: number;
  lastPurchasedAt?: string;
  /** Predicted run-out date. */
  nextDate?: Date;
  /** Whole days until the predicted run-out (0 = today, negative = overdue). */
  daysLeft?: number;
}

/**
 * Stock status from the last purchase date and the average interval:
 * - critical: predicted run-out date is today or already passed
 * - warning:  runs out in fewer than 3 days
 * - ok:       more time left
 * - unknown:  fewer than 2 purchases, no rhythm yet
 */
export function stockStatus(info: ReplenishInfo | undefined, now = new Date()): StockPrediction {
  if (!info?.lastPurchasedAt || !info.avgIntervalDays) return { status: "unknown", lastPurchasedAt: info?.lastPurchasedAt };
  const nextDate = new Date(dayStart(info.lastPurchasedAt) + Math.round(info.avgIntervalDays) * DAY_MS);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((nextDate.getTime() - today.getTime()) / DAY_MS);
  const status: StockStatus = daysLeft <= 0 ? "critical" : daysLeft < WARNING_DAYS ? "warning" : "ok";
  return { status, avgIntervalDays: info.avgIntervalDays, lastPurchasedAt: info.lastPurchasedAt, nextDate, daysLeft };
}

/** Products about to run out (warning or critical), most urgent first. */
export function runningLow(products: Product[], now = new Date()) {
  return products
    .map((product) => ({ product, prediction: stockStatus(product.replenish, now) }))
    .filter(({ prediction }) => prediction.status === "warning" || prediction.status === "critical")
    .sort((a, b) => (a.prediction.daysLeft ?? 0) - (b.prediction.daysLeft ?? 0));
}

/** "Compras esto cada 15 días" style label. */
export function frequencyLabel(avgIntervalDays: number) {
  const d = Math.round(avgIntervalDays);
  if (d <= 1) return "Compras esto a diario";
  if (d === 7) return "Compras esto cada semana";
  if (d === 14 || d === 15) return `Compras esto cada ${d} días (quincenal)`;
  if (d >= 28 && d <= 31) return "Compras esto cada mes";
  return `Compras esto cada ${d} días`;
}

/** "Se acabó hace 2 días" / "Toca reponer hoy" / "Quedan ~2 días". */
export function runOutLabel(daysLeft: number) {
  if (daysLeft < -1) return `Se acabó hace ${-daysLeft} días`;
  if (daysLeft === -1) return "Se acabó ayer";
  if (daysLeft === 0) return "Toca reponer hoy";
  if (daysLeft === 1) return "Se acaba mañana";
  return `Se acaba en ~${daysLeft} días`;
}
