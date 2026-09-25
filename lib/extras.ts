"use client";

import { createLocalList } from "./localList";
import { isInRange, round2, uid, weekRange } from "./utils";

/**
 * Extra incomes (sales, freelance work, bonuses, gifts) and extra / unexpected
 * expenses (health, emergencies, repairs, occasional treats). Each list has its
 * own LocalStorage key. They count in the weekly balance but stay out of the
 * despensa reports, so one-off costs don't distort the grocery averages.
 */

export const EXTRA_INCOME_SOURCES = ["Venta", "Trabajo independiente", "Bono", "Regalo", "Otro"] as const;
export type ExtraIncomeSource = (typeof EXTRA_INCOME_SOURCES)[number];

export const EXTRA_EXPENSE_CATEGORIES = ["Salud", "Emergencia", "Reparaciones", "Gusto ocasional", "Otro"] as const;
export type ExtraExpenseCategory = (typeof EXTRA_EXPENSE_CATEGORIES)[number];

export interface ExtraIncome {
  id: string;
  amount: number;
  source: ExtraIncomeSource;
  description: string;
  /** ISO date of when the money came in. */
  date: string;
}

export interface ExtraExpense {
  id: string;
  amount: number;
  category: ExtraExpenseCategory;
  description: string;
  date: string;
}

export const extraIncomes = createLocalList<ExtraIncome>("rindemas_extra_incomes");
export const extraExpenses = createLocalList<ExtraExpense>("rindemas_extra_expenses");

export type ExtraIncomeInput = Omit<ExtraIncome, "id" | "date"> & { date?: string };
export type ExtraExpenseInput = Omit<ExtraExpense, "id" | "date"> & { date?: string };

export function addExtraIncome(input: ExtraIncomeInput) {
  extraIncomes.add({
    ...input,
    id: uid("inc"),
    amount: round2(input.amount),
    description: input.description.trim() || input.source,
    date: input.date ?? new Date().toISOString(),
  });
}

export function updateExtraIncome(id: string, input: ExtraIncomeInput) {
  extraIncomes.update(id, { ...input, amount: round2(input.amount), description: input.description.trim() || input.source });
}

export function addExtraExpense(input: ExtraExpenseInput) {
  extraExpenses.add({
    ...input,
    id: uid("exp"),
    amount: round2(input.amount),
    description: input.description.trim() || input.category,
    date: input.date ?? new Date().toISOString(),
  });
}

export function updateExtraExpense(id: string, input: ExtraExpenseInput) {
  extraExpenses.update(id, { ...input, amount: round2(input.amount), description: input.description.trim() || input.category });
}

/* ---------- Summaries ---------- */

export function sumInWeek(items: { amount: number; date: string }[], offset = 0, now = new Date()) {
  const range = weekRange(offset, now);
  return round2(items.filter((i) => isInRange(i.date, range)).reduce((a, i) => a + i.amount, 0));
}

function monthRange(now = new Date()): [Date, Date] {
  return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)];
}

/** "Gastos Ocasionales del Mes": total and per category for the current month. */
export function occasionalExpensesThisMonth(items: ExtraExpense[], now = new Date()) {
  const range = monthRange(now);
  const month = items.filter((i) => isInRange(i.date, range));
  const byCategory = EXTRA_EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: round2(month.filter((i) => i.category === category).reduce((a, i) => a + i.amount, 0)),
  })).filter((c) => c.amount > 0);
  return { total: round2(month.reduce((a, i) => a + i.amount, 0)), count: month.length, byCategory };
}

export function incomesThisMonth(items: ExtraIncome[], now = new Date()) {
  const range = monthRange(now);
  const month = items.filter((i) => isInRange(i.date, range));
  return { total: round2(month.reduce((a, i) => a + i.amount, 0)), count: month.length };
}

/* ---------- Example data (Ajustes → "Cargar datos de ejemplo") ---------- */

export function loadDemoExtras(now = new Date()) {
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
  extraIncomes.replaceAll([
    { id: "inc_demo_1", amount: 850, source: "Venta", description: "Venta de tamales", date: daysAgo(1) },
    { id: "inc_demo_2", amount: 1200, source: "Trabajo independiente", description: "Arreglo de un jardín", date: daysAgo(9) },
  ]);
  extraExpenses.replaceAll([
    { id: "exp_demo_1", amount: 650, category: "Salud", description: "Consulta médica y medicinas", date: daysAgo(2) },
    { id: "exp_demo_2", amount: 380, category: "Reparaciones", description: "Plomero: fuga en la cocina", date: daysAgo(12) },
  ]);
}
