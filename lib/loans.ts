"use client";

import { createLocalList } from "./localList";
import { round2, uid } from "./utils";

/**
 * Installment loans and financing ("Control de Préstamos"), stored locally
 * under "rindemas_loans". Each payment of an installment counts as money out
 * in the weekly balance.
 */

export type LoanFrequency = "mensual" | "quincenal";

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
}

export interface Loan {
  id: string;
  /** What it's for / who lends it, e.g. "Consulta médica · Banco Azteca". */
  name: string;
  /** Total to pay back, interest included. */
  total: number;
  /** Number of installments (months or quincenas). */
  installments: number;
  frequency: LoanFrequency;
  /** Payment due day of the month (quincenal: this day and 15 days later). */
  dueDay: number;
  payments: LoanPayment[];
  createdAt: string;
}

export const loans = createLocalList<Loan>("rindemas_loans");

export type LoanInput = Pick<Loan, "name" | "total" | "installments" | "frequency" | "dueDay">;

/* ---------- Math ---------- */

/** Amount per installment: total ÷ number of installments. */
export const installmentAmount = (l: Pick<Loan, "total" | "installments">) =>
  l.installments > 0 ? round2(l.total / l.installments) : l.total;

export const paidAmount = (l: Loan) => round2(l.payments.reduce((a, p) => a + p.amount, 0));
export const remainingAmount = (l: Loan) => Math.max(0, round2(l.total - paidAmount(l)));
export const isPaidOff = (l: Loan) => remainingAmount(l) <= 0.009;

/** Installments covered so far (partial amounts don't count as a full one). */
export const paidInstallments = (l: Loan) => Math.min(l.installments, Math.floor(paidAmount(l) / installmentAmount(l) + 1e-6));

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** All due dates from two months back to three months ahead, sorted. */
function dueDatesAround(l: Loan, today: Date): Date[] {
  const days = l.frequency === "quincenal" ? [l.dueDay, l.dueDay + 15] : [l.dueDay];
  const dates: Date[] = [];
  for (let add = -2; add <= 3; add++) {
    const first = new Date(today.getFullYear(), today.getMonth() + add, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    for (const d of days) {
      const day = d > 31 ? d - 30 : d;
      dates.push(new Date(y, m, Math.min(day, daysInMonth(y, m))));
    }
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

/**
 * Next payment date (today counts). Quincenal loans are due on dueDay and 15
 * days later. If an installment was already paid during the current cycle
 * (after the previous due date), that due date counts as covered and the
 * following one is returned.
 */
export function nextDueDate(l: Loan, now = new Date()): Date {
  const today = startOfDay(now);
  const dates = dueDatesAround(l, today);
  const i = dates.findIndex((d) => d >= today);
  if (i === -1) return today;
  const previous = dates[i - 1];
  const last = l.payments.length ? startOfDay(new Date(l.payments[l.payments.length - 1].date)) : null;
  const coveredThisCycle = !!last && !!previous && last > previous;
  return coveredThisCycle && dates[i + 1] ? dates[i + 1] : dates[i];
}

export type PaymentAlert = "ok" | "warning" | "critical";

/** Reminder level for the next payment: 3 days left = yellow, 2/1/0 days = red. */
export function paymentAlert(l: Loan, now = new Date()): { level: PaymentAlert; daysLeft: number; due: Date } | null {
  if (isPaidOff(l)) return null;
  const due = nextDueDate(l, now);
  const daysLeft = Math.round((due.getTime() - startOfDay(now).getTime()) / 86_400_000);
  return { level: daysLeft <= 2 ? "critical" : daysLeft === 3 ? "warning" : "ok", daysLeft, due };
}

/** Loans whose next payment is 3 days away or closer. */
export function upcomingLoanPayments(items: Loan[], now = new Date()) {
  return items
    .map((loan) => ({ loan, alert: paymentAlert(loan, now) }))
    .filter((x): x is { loan: Loan; alert: NonNullable<ReturnType<typeof paymentAlert>> } => !!x.alert && x.alert.level !== "ok")
    .sort((a, b) => a.alert.daysLeft - b.alert.daysLeft);
}

export function dueLabel(daysLeft: number) {
  if (daysLeft === 0) return "Pago vence hoy";
  if (daysLeft === 1) return "Pago vence mañana";
  return `Pago vence en ${daysLeft} días`;
}

/** Plan Gratuito includes one active (not yet paid off) loan. */
export const FREE_ACTIVE_LOANS = 1;

/** Every loan payment, for the weekly balance. */
export const allLoanPayments = (items: Loan[]) => items.flatMap((l) => l.payments);

/* ---------- Actions ---------- */

export function addLoan(input: LoanInput) {
  loans.add({ ...input, name: input.name.trim(), total: round2(input.total), id: uid("loan"), payments: [], createdAt: new Date().toISOString() });
}

/** Edits the loan's data; payments already made are kept. */
export function updateLoan(id: string, input: LoanInput) {
  loans.update(id, { ...input, name: input.name.trim(), total: round2(input.total) });
}

export const deleteLoan = (id: string) => loans.remove(id);

/** Pays one installment (or whatever is left, if less). Returns the amount paid and whether it's paid off. */
export function payInstallment(id: string): { paid: number; paidOff: boolean } {
  const loan = loans.all().find((l) => l.id === id);
  if (!loan) return { paid: 0, paidOff: false };
  const amount = Math.min(installmentAmount(loan), remainingAmount(loan));
  if (amount <= 0) return { paid: 0, paidOff: true };
  const payments = [...loan.payments, { id: uid("lpay"), amount: round2(amount), date: new Date().toISOString() }];
  loans.update(id, { payments });
  return { paid: round2(amount), paidOff: remainingAmount({ ...loan, payments }) <= 0.009 };
}

/** Undo for a mis-tapped payment. */
export function undoLastPayment(id: string) {
  const loan = loans.all().find((l) => l.id === id);
  if (loan?.payments.length) loans.update(id, { payments: loan.payments.slice(0, -1) });
}

/* ---------- Example data ---------- */

export function loadDemoLoans(now = new Date()) {
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
  loans.replaceAll([
    {
      id: "loan_demo_1",
      name: "Consulta médica · préstamo de caja popular",
      total: 3600,
      installments: 6,
      frequency: "mensual",
      dueDay: 10,
      payments: [
        { id: "lp_1", amount: 600, date: daysAgo(45) },
        { id: "lp_2", amount: 600, date: daysAgo(15) },
      ],
      createdAt: daysAgo(60),
    },
    {
      id: "loan_demo_2",
      name: "Celular a quincenas",
      total: 4800,
      installments: 12,
      frequency: "quincenal",
      dueDay: 1,
      payments: [{ id: "lp_3", amount: 400, date: daysAgo(10) }],
      createdAt: daysAgo(20),
    },
  ]);
}
