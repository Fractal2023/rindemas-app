import type { FinanceState, Product, Transaction, TxKind } from "./types";
import { isInRange, weekRange } from "./utils";

export type Trend = "up" | "down" | "flat";

export interface PriceVariation {
  current: number;
  previous: number | null;
  delta: number;
  pct: number;
  trend: Trend;
  updatedAt: string;
}

/** Compares the latest registered price against the one registered before it. */
export function priceVariation(product: Product): PriceVariation {
  const h = product.history;
  const last = h[h.length - 1];
  const prev = h.length > 1 ? h[h.length - 2] : null;
  if (!prev || prev.price === 0) {
    return { current: last?.price ?? 0, previous: prev?.price ?? null, delta: 0, pct: 0, trend: "flat", updatedAt: last?.date ?? "" };
  }
  const delta = last.price - prev.price;
  const pct = (delta / prev.price) * 100;
  const trend: Trend = Math.abs(pct) < 0.05 ? "flat" : pct > 0 ? "up" : "down";
  return { current: last.price, previous: prev.price, delta, pct: trend === "flat" ? 0 : pct, trend, updatedAt: last.date };
}

/** Biggest price moves among products updated in the last 7 days. */
export function topPriceAlerts(products: Product[], limit = 3, now = new Date()) {
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return products
    .map((p) => ({ product: p, v: priceVariation(p) }))
    .filter(({ v }) => v.trend !== "flat" && new Date(v.updatedAt).getTime() >= weekAgo)
    .sort((a, b) => Math.abs(b.v.pct) - Math.abs(a.v.pct))
    .slice(0, limit);
}

/** Average price variation of the tracked basket (products with a previous price). */
export function basketInflation(products: Product[]) {
  const vs = products.map(priceVariation).filter((v) => v.previous != null);
  if (!vs.length) return 0;
  return vs.reduce((acc, v) => acc + v.pct, 0) / vs.length;
}

export function trendCounts(products: Product[]) {
  const counts: Record<Trend, number> = { up: 0, down: 0, flat: 0 };
  products.forEach((p) => counts[priceVariation(p).trend]++);
  return counts;
}

export function txInWeek(transactions: Transaction[], offset: number, now = new Date()) {
  const range = weekRange(offset, now);
  return transactions.filter((t) => isInRange(t.date, range));
}

export function sumBy(transactions: Transaction[], kinds: TxKind[]) {
  return transactions.filter((t) => kinds.includes(t.kind)).reduce((acc, t) => acc + t.amount, 0);
}

export interface WeeklySummary {
  income: number;
  received: number;
  /** Extra incomes this week (sales, bonuses, gifts…). */
  extraIncome: number;
  despensa: number;
  gusto: number;
  abonos: number;
  /** Extra / unexpected expenses this week. */
  extras: number;
  /** Loan installments paid this week. */
  loanPayments: number;
  spent: number;
  available: number;
  /** 0..n share of the week's money already spent */
  usage: number;
  daysLeft: number;
}

/** Money movements kept outside the main finance state (their own LocalStorage keys). */
export interface WeeklyExtras {
  extraIncomes: { amount: number; date: string }[];
  extraExpenses: { amount: number; date: string }[];
  loanPayments: { amount: number; date: string }[];
}

export function weeklySummary(state: FinanceState, now = new Date(), extras?: WeeklyExtras): WeeklySummary {
  const week = txInWeek(state.transactions, 0, now);
  const range = weekRange(0, now);
  const sumWeek = (items: { amount: number; date: string }[] = []) =>
    items.filter((i) => isInRange(i.date, range)).reduce((a, i) => a + i.amount, 0);
  const income = state.settings.weeklyIncome;
  const received = sumBy(week, ["cobro"]);
  const extraIncome = sumWeek(extras?.extraIncomes);
  const despensa = sumBy(week, ["despensa"]);
  const gusto = sumBy(week, ["gusto"]);
  const abonos = sumBy(week, ["abono"]);
  const extraSpent = sumWeek(extras?.extraExpenses);
  const loanPayments = sumWeek(extras?.loanPayments);
  const spent = despensa + gusto + abonos + extraSpent + loanPayments;
  const budget = income + received + extraIncome;
  const todayIndex = (now.getDay() + 6) % 7;
  return {
    income,
    received,
    extraIncome,
    despensa,
    gusto,
    abonos,
    extras: extraSpent,
    loanPayments,
    spent,
    available: budget - spent,
    usage: budget > 0 ? spent / budget : 0,
    daysLeft: 7 - todayIndex,
  };
}

export interface Breakdown {
  necesidad: number;
  gusto: number;
  deudas: number;
  total: number;
}

export function breakdown(transactions: Transaction[]): Breakdown {
  const necesidad = sumBy(transactions, ["despensa"]);
  const gusto = sumBy(transactions, ["gusto"]);
  const deudas = sumBy(transactions, ["abono"]);
  return { necesidad, gusto, deudas, total: necesidad + gusto + deudas };
}

export function categoryTotals(transactions: Transaction[]) {
  const map = new Map<string, { category: string; kind: TxKind; amount: number }>();
  transactions
    .filter((t) => t.kind !== "cobro")
    .forEach((t) => {
      const key = `${t.kind}:${t.category}`;
      const cur = map.get(key) ?? { category: t.category, kind: t.kind, amount: 0 };
      cur.amount += t.amount;
      map.set(key, cur);
    });
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function debtTotals(state: FinanceState) {
  const owe = state.debts.filter((d) => d.direction === "debo").reduce((a, d) => a + d.pending, 0);
  const owed = state.debts.filter((d) => d.direction === "me-deben").reduce((a, d) => a + d.pending, 0);
  return { owe, owed };
}
