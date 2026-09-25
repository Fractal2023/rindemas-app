"use client";

import { useSyncExternalStore } from "react";
import { createLocalStorageAdapter } from "./storage";
import { round2, uid } from "./utils";

/**
 * Subscription manager (RindeMás PRO). Stored 100% locally under its own
 * LocalStorage key, separate from the main finance data.
 */

export const SUBSCRIPTIONS_KEY = "rindemas_subscriptions";

export type SubscriptionFrequency = "mensual" | "anual";

export interface Subscription {
  id: string;
  name: string;
  /** Amount charged each period, in MXN. */
  amount: number;
  frequency: SubscriptionFrequency;
  /** Day of the month it's charged (1–31; clamped to short months). */
  billingDay: number;
  /** Month it's charged (1–12), only for yearly subscriptions. */
  billingMonth?: number;
  isTrial: boolean;
  /** Last day to cancel without being charged, as "YYYY-MM-DD". Required for trials. */
  cancelBy?: string;
  /** Cancellation link or instructions ("Cuenta → Membresía → Cancelar"). */
  cancelInfo?: string;
  status: "activa" | "cancelada";
  createdAt: string;
  cancelledAt?: string;
}

interface SubscriptionsState {
  version: 1;
  items: Subscription[];
}

function isState(v: unknown): v is SubscriptionsState {
  const s = v as SubscriptionsState;
  return !!s && s.version === 1 && Array.isArray(s.items);
}

const storage = createLocalStorageAdapter<SubscriptionsState>(SUBSCRIPTIONS_KEY, isState);

/* ---------- Dates ---------- */

const DAY_MS = 86_400_000;

function today(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "YYYY-MM-DD" → local midnight. */
export function parseLocalDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toYmd(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const daysInMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

/** Next date the subscription will be charged (today counts). */
export function nextChargeDate(sub: Subscription, now = new Date()): Date {
  const t = today(now);
  if (sub.frequency === "anual") {
    const month = (sub.billingMonth ?? 1) - 1;
    for (const year of [t.getFullYear(), t.getFullYear() + 1]) {
      const d = new Date(year, month, Math.min(sub.billingDay, daysInMonth(year, month)));
      if (d >= t) return d;
    }
  }
  // This month or next, clamping e.g. day 31 to the last day of shorter months.
  for (let add = 0; add < 2; add++) {
    const month = new Date(t.getFullYear(), t.getMonth() + add, 1);
    const y = month.getFullYear();
    const m = month.getMonth();
    const d = new Date(y, m, Math.min(sub.billingDay, daysInMonth(y, m)));
    if (d >= t) return d;
  }
  return t;
}

/** Whole days from today until the cancellation deadline (0 = today, negative = passed). */
export function daysUntil(ymd: string, now = new Date()) {
  return Math.round((parseLocalDate(ymd).getTime() - today(now).getTime()) / DAY_MS);
}

export type TrialAlert = "ok" | "warning" | "critical" | "expired";

/** Traffic light for a free trial: 3 days left = yellow, 2/1/0 days = red. */
export function trialAlert(sub: Subscription, now = new Date()): { level: TrialAlert; daysLeft?: number } {
  if (!sub.isTrial || !sub.cancelBy) return { level: "ok" };
  const daysLeft = daysUntil(sub.cancelBy, now);
  if (daysLeft < 0) return { level: "expired", daysLeft };
  if (daysLeft <= 2) return { level: "critical", daysLeft };
  if (daysLeft === 3) return { level: "warning", daysLeft };
  return { level: "ok", daysLeft };
}

export function deadlineLabel(daysLeft: number) {
  if (daysLeft < 0) return `Venció hace ${-daysLeft} ${daysLeft === -1 ? "día" : "días"}`;
  if (daysLeft === 0) return "Cancela hoy";
  if (daysLeft === 1) return "Cancela a más tardar mañana";
  return `Faltan ${daysLeft} días para cancelar`;
}

/* ---------- Money ---------- */

export const monthlyCost = (s: Subscription) => (s.frequency === "anual" ? s.amount / 12 : s.amount);
export const yearlyCost = (s: Subscription) => (s.frequency === "anual" ? s.amount : s.amount * 12);

export function summarize(items: Subscription[]) {
  const active = items.filter((s) => s.status === "activa" && !s.isTrial);
  const trials = items.filter((s) => s.status === "activa" && s.isTrial);
  return {
    monthly: round2(active.reduce((a, s) => a + monthlyCost(s), 0)),
    yearly: round2(active.reduce((a, s) => a + yearlyCost(s), 0)),
    /** What trials will add per month if they're not cancelled in time. */
    trialsMonthly: round2(trials.reduce((a, s) => a + monthlyCost(s), 0)),
    activeCount: active.length,
    trialCount: trials.length,
  };
}

/** Trials whose cancellation deadline is 3 days away or closer (not yet passed). */
export function urgentTrials(items: Subscription[], now = new Date()) {
  return items.filter((s) => {
    if (s.status !== "activa") return false;
    const { level } = trialAlert(s, now);
    return level === "warning" || level === "critical";
  });
}

/**
 * Splits the cancellation info into a link (first http(s) URL or bare domain)
 * and the remaining written instructions.
 */
export function parseCancelInfo(info: string | undefined): { link: string | null; note: string | null } {
  const text = info?.trim();
  if (!text) return { link: null, note: null };
  const m = text.match(/https?:\/\/[^\s]+/i) ?? text.match(/\b(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?/i);
  let link: string | null = null;
  if (m) {
    try {
      const parsed = new URL(m[0].startsWith("http") ? m[0] : `https://${m[0]}`);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") link = parsed.href;
    } catch {
      link = null;
    }
  }
  const note = (link && m ? text.replace(m[0], "") : text).replace(/\s+/g, " ").trim();
  return { link, note: note || null };
}

/* ---------- Demo data ---------- */

export function demoSubscriptions(now = new Date()): Subscription[] {
  const t = today(now);
  const inDays = (n: number) => toYmd(new Date(t.getTime() + n * DAY_MS));
  const created = new Date(t.getTime() - 40 * DAY_MS).toISOString();
  return [
    { id: "sub_1", name: "Netflix Estándar", amount: 249, frequency: "mensual", billingDay: 5, isTrial: false, cancelInfo: "https://www.netflix.com/cancelplan", status: "activa", createdAt: created },
    { id: "sub_2", name: "Spotify Familiar", amount: 199, frequency: "mensual", billingDay: 12, isTrial: false, cancelInfo: "https://www.spotify.com/mx/account/subscription/", status: "activa", createdAt: created },
    { id: "sub_3", name: "Amazon Prime", amount: 899, frequency: "anual", billingDay: 20, billingMonth: 3, isTrial: false, cancelInfo: "Cuenta y listas → Membresía Prime → Cancelar membresía", status: "activa", createdAt: created },
    { id: "sub_4", name: "Disney+", amount: 179, frequency: "mensual", billingDay: t.getDate(), isTrial: true, cancelBy: inDays(2), cancelInfo: "https://www.disneyplus.com/account/subscription", status: "activa", createdAt: created },
    { id: "sub_5", name: "Canva Pro", amount: 1099, frequency: "anual", billingDay: t.getDate(), billingMonth: t.getMonth() + 1, isTrial: true, cancelBy: inDays(3), cancelInfo: "Configuración → Facturación y planes → Cancelar suscripción", status: "activa", createdAt: created },
    { id: "sub_6", name: "Paramount+", amount: 79, frequency: "mensual", billingDay: 28, isTrial: false, status: "cancelada", createdAt: created, cancelledAt: new Date(t.getTime() - 10 * DAY_MS).toISOString() },
  ];
}

/* ---------- Store ---------- */

let state: SubscriptionsState | null = null;
const listeners = new Set<() => void>();

function ensure(): SubscriptionsState {
  if (!state) {
    // First visit: empty list. Example subscriptions are opt-in (Ajustes → "Cargar datos de ejemplo").
    state = storage.load() ?? { version: 1, items: [] };
    storage.save(state);
  }
  return state;
}

function set(updater: (s: SubscriptionsState) => SubscriptionsState) {
  state = updater(ensure());
  storage.save(state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const unwatch = storage.onExternalChange(() => {
    state = storage.load() ?? state;
    listeners.forEach((l) => l());
  });
  return () => {
    listeners.delete(listener);
    unwatch();
  };
}

const EMPTY: Subscription[] = [];

export function useSubscriptions(): Subscription[] {
  return useSyncExternalStore(
    subscribe,
    () => ensure().items,
    () => EMPTY,
  );
}

export type NewSubscription = Omit<Subscription, "id" | "status" | "createdAt" | "cancelledAt">;

export function addSubscription(input: NewSubscription) {
  const sub: Subscription = {
    ...input,
    name: input.name.trim(),
    amount: round2(input.amount),
    cancelInfo: input.cancelInfo?.trim() || undefined,
    cancelBy: input.cancelBy || undefined,
    billingMonth: input.frequency === "anual" ? input.billingMonth : undefined,
    id: uid("sub"),
    status: "activa",
    createdAt: new Date().toISOString(),
  };
  set((s) => ({ ...s, items: [sub, ...s.items] }));
}

function patch(id: string, changes: Partial<Subscription>) {
  set((s) => ({ ...s, items: s.items.map((x) => (x.id === id ? { ...x, ...changes } : x)) }));
}

/** Edits an existing subscription (fix amount, dates, cancellation info…). */
export function updateSubscription(id: string, input: NewSubscription) {
  patch(id, {
    ...input,
    name: input.name.trim(),
    amount: round2(input.amount),
    cancelInfo: input.cancelInfo?.trim() || undefined,
    cancelBy: input.cancelBy || undefined,
    billingMonth: input.frequency === "anual" ? input.billingMonth : undefined,
  });
}

export const cancelSubscription = (id: string) => patch(id, { status: "cancelada", cancelledAt: new Date().toISOString() });
export const reactivateSubscription = (id: string) => patch(id, { status: "activa", cancelledAt: undefined });
/** The user decided to keep a trial: it becomes a regular active subscription. */
export const keepTrial = (id: string) => patch(id, { isTrial: false });

export function deleteSubscription(id: string) {
  set((s) => ({ ...s, items: s.items.filter((x) => x.id !== id) }));
}

/** Used by Ajustes → "Cargar datos de ejemplo". */
export function loadDemoSubscriptions() {
  set(() => ({ version: 1, items: demoSubscriptions() }));
}

/** Used by "Eliminar definitivamente mis datos": leaves an empty list (no demo re-seed). */
export function wipeSubscriptions() {
  storage.clear();
  set(() => ({ version: 1, items: [] }));
}

/** Current list for backups (reads storage if the page never showed subscriptions). */
export function subscriptionsForExport(): Subscription[] {
  return ensure().items;
}
