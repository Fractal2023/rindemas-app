"use client";

import { useSyncExternalStore } from "react";
import { canUseTheme, FREE_PLAN, planStatus, TRIAL_DAYS } from "./plan";
import { createDemoState, createEmptyState } from "./seed";
import { createLocalStorageAdapter, STORAGE_KEY } from "./storage";
import { withReplenishment } from "./replenishment";
import { hashPin, markSessionUnlocked, newSalt } from "./security";
import { loadDemoSubscriptions, subscriptionsForExport, wipeSubscriptions } from "./subscriptions";
import { DEFAULT_THEME, getTheme, isProTheme } from "./themes";
import type {
  Debt,
  DebtDirection,
  DebtKind,
  FinanceState,
  Product,
  ProductCategory,
  Settings,
  ThemeId,
  Transaction,
  Unit,
} from "./types";
import { normalize, round2, uid } from "./utils";

/** Key used before the RindeMás rebrand; migrated once on first load. */
const LEGACY_STORAGE_KEY = "gastos-familiares:v1";

function isFinanceState(v: unknown): v is FinanceState {
  const s = v as FinanceState;
  return (
    !!s &&
    s.version === 1 &&
    Array.isArray(s.products) &&
    Array.isArray(s.transactions) &&
    Array.isArray(s.debts) &&
    typeof s.settings?.weeklyIncome === "number"
  );
}

/** Fills in fields added after data was first saved (theme, plan, shopping list, purchase rhythm). */
function withDefaults(s: FinanceState): FinanceState {
  return {
    ...s,
    products: withReplenishment(s.products, s.transactions),
    shoppingList: Array.isArray(s.shoppingList) ? s.shoppingList : [],
    settings: {
      ...s.settings,
      theme: getTheme(s.settings.theme).id,
      plan: s.settings.plan?.tier ? s.settings.plan : FREE_PLAN,
    },
  };
}

const storage = createLocalStorageAdapter<FinanceState>(STORAGE_KEY, isFinanceState);
const legacyStorage = createLocalStorageAdapter<FinanceState>(LEGACY_STORAGE_KEY, isFinanceState);

/* ---------- Tiny external store ---------- */

let state: FinanceState | null = null;
const listeners = new Set<() => void>();
let unwatch: (() => void) | null = null;

function ensureState(): FinanceState {
  if (!state) {
    const loaded = storage.load();
    const legacy = loaded ? null : legacyStorage.load();
    if (loaded) {
      state = withDefaults(loaded);
    } else if (legacy) {
      state = withDefaults(legacy);
      storage.save(state);
      legacyStorage.clear();
    } else {
      // First visit: start empty. Example data is opt-in from Ajustes.
      state = createEmptyState();
      storage.save(state);
    }
  }
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!unwatch) {
    unwatch = storage.onExternalChange(() => {
      const external = storage.load();
      if (external) state = withDefaults(external);
      emit();
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && unwatch) {
      unwatch();
      unwatch = null;
    }
  };
}

function setState(updater: (s: FinanceState) => FinanceState) {
  state = updater(ensureState());
  storage.save(state);
  emit();
}

/** Returns `null` during SSR / hydration, then the persisted state. */
export function useFinance(): FinanceState | null {
  return useSyncExternalStore(subscribe, ensureState, () => null);
}

/** Use inside components rendered behind <FinanceGate>. */
export function useFinanceState(): FinanceState {
  const s = useFinance();
  if (!s) throw new Error("useFinanceState must be used inside <FinanceGate>");
  return s;
}

/* ---------- Actions ---------- */

function sortTx(list: Transaction[]) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

export interface ProductInput {
  name: string;
  unit: Unit;
  category: ProductCategory;
  quantity: number;
}

/** Records a price for a product (creating it if needed). Returns the product id. */
function upsertProductPrice(
  products: Product[],
  input: Omit<ProductInput, "quantity">,
  unitPrice: number,
  date: string,
): { products: Product[]; productId: string } {
  const key = normalize(input.name);
  const existing = products.find((p) => normalize(p.name) === key);
  const point = { price: round2(unitPrice), date };

  if (existing) {
    return {
      productId: existing.id,
      products: products.map((p) =>
        p.id === existing.id ? { ...p, unit: input.unit, history: [...p.history, point] } : p,
      ),
    };
  }
  const product: Product = {
    id: uid("prod"),
    name: input.name.trim(),
    unit: input.unit,
    category: input.category,
    history: [point],
  };
  return { productId: product.id, products: [...products, product] };
}

export function addExpense(input: {
  kind: "despensa" | "gusto";
  amount: number;
  description: string;
  category: string;
  product?: ProductInput;
}) {
  setState((s) => {
    const date = new Date().toISOString();
    let products = s.products;
    let productId: string | undefined;
    let category = input.category;

    if (input.kind === "despensa" && input.product && input.product.name.trim()) {
      const qty = input.product.quantity > 0 ? input.product.quantity : 1;
      const res = upsertProductPrice(products, input.product, input.amount / qty, date);
      products = res.products;
      productId = res.productId;
      category = products.find((p) => p.id === productId)?.category ?? category;
    }

    const tx: Transaction = {
      id: uid("tx"),
      kind: input.kind,
      amount: round2(input.amount),
      description: input.description.trim() || (input.kind === "despensa" ? "Despensa" : "Gusto"),
      category,
      date,
      productId,
    };
    const transactions = sortTx([tx, ...s.transactions]);
    return {
      ...s,
      // Buying a product updates its purchase rhythm and checks it off today's list.
      products: withReplenishment(products, transactions),
      transactions,
      shoppingList: productId ? s.shoppingList.filter((i) => i.productId !== productId) : s.shoppingList,
    };
  });
}

/**
 * Fixes a product's details. `price`, when given, corrects the latest recorded
 * price (a capture error), instead of adding a new price record.
 */
export function updateProduct(
  productId: string,
  changes: { name: string; unit: Unit; category: ProductCategory; price?: number },
) {
  setState((s) => ({
    ...s,
    products: s.products.map((p) => {
      if (p.id !== productId) return p;
      let history = p.history;
      if (changes.price !== undefined && changes.price > 0) {
        const price = round2(changes.price);
        history = history.length
          ? [...history.slice(0, -1), { ...history[history.length - 1], price }]
          : [{ price, date: new Date().toISOString() }];
      }
      return { ...p, name: changes.name.trim() || p.name, unit: changes.unit, category: changes.category, history };
    }),
  }));
}

/** Removes a product from the tracker. Past purchases stay in the activity history. */
export function deleteProduct(productId: string) {
  setState((s) => ({
    ...s,
    products: s.products.filter((p) => p.id !== productId),
    shoppingList: s.shoppingList.filter((i) => i.productId !== productId),
  }));
}

export function recordPrice(productId: string, price: number) {
  setState((s) => ({
    ...s,
    products: s.products.map((p) =>
      p.id === productId
        ? { ...p, history: [...p.history, { price: round2(price), date: new Date().toISOString() }] }
        : p,
    ),
  }));
}

export function addProduct(input: { name: string; unit: Unit; category: ProductCategory; price: number }) {
  setState((s) => ({
    ...s,
    products: upsertProductPrice(s.products, input, input.price, new Date().toISOString()).products,
  }));
}

/**
 * Applies a payment to a debt. For debts I owe this is money out ("abono");
 * for debts owed to me it's money in ("cobro"). Returns whether it was fully paid.
 */
export function payDebt(debtId: string, rawAmount: number): { paid: number; settled: boolean } {
  const debt = ensureState().debts.find((d) => d.id === debtId);
  if (!debt) return { paid: 0, settled: false };
  const amount = round2(Math.min(rawAmount, debt.pending));
  if (amount <= 0) return { paid: 0, settled: debt.pending <= 0 };

  const date = new Date().toISOString();
  const paymentId = uid("pay");
  const pending = round2(debt.pending - amount);

  setState((s) => {
    const owe = debt.direction === "debo";
    const tx: Transaction = {
      id: uid("tx"),
      kind: owe ? "abono" : "cobro",
      amount,
      description: owe ? `Abono a ${debt.counterparty}` : `Cobro a ${debt.counterparty}`,
      category: owe ? "Deudas" : "Cobros",
      date,
      debtId,
      paymentId,
    };
    return {
      ...s,
      debts: s.debts.map((d) =>
        d.id === debtId ? { ...d, pending, payments: [...d.payments, { id: paymentId, amount, date }] } : d,
      ),
      transactions: sortTx([tx, ...s.transactions]),
    };
  });
  return { paid: amount, settled: pending <= 0 };
}

export function addDebt(input: {
  direction: DebtDirection;
  kind: DebtKind;
  counterparty: string;
  concept: string;
  total: number;
}) {
  const debt: Debt = {
    id: uid("debt"),
    ...input,
    counterparty: input.counterparty.trim(),
    concept: input.concept.trim(),
    total: round2(input.total),
    pending: round2(input.total),
    createdAt: new Date().toISOString(),
    payments: [],
  };
  setState((s) => ({ ...s, debts: [debt, ...s.debts] }));
}

export function deleteDebt(debtId: string) {
  setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== debtId) }));
}

/** Deletes a transaction; if it was a debt payment, the debt balance is restored. */
export function deleteTransaction(txId: string) {
  setState((s) => {
    const tx = s.transactions.find((t) => t.id === txId);
    if (!tx) return s;
    const debts =
      tx.debtId && tx.paymentId
        ? s.debts.map((d) =>
            d.id === tx.debtId
              ? {
                  ...d,
                  pending: round2(Math.min(d.total, d.pending + tx.amount)),
                  payments: d.payments.filter((p) => p.id !== tx.paymentId),
                }
              : d,
          )
        : s.debts;
    const transactions = s.transactions.filter((t) => t.id !== txId);
    const products = tx.productId ? withReplenishment(s.products, transactions) : s.products;
    return { ...s, debts, products, transactions };
  });
}

/* ---------- Shopping list ("la compra de hoy") ---------- */

export function addToShoppingList(productIds: string[]) {
  setState((s) => {
    const existing = new Set(s.shoppingList.map((i) => i.productId));
    const addedAt = new Date().toISOString();
    const added = productIds.filter((id) => !existing.has(id)).map((productId) => ({ productId, addedAt }));
    return added.length ? { ...s, shoppingList: [...s.shoppingList, ...added] } : s;
  });
}

export function removeFromShoppingList(productId: string) {
  setState((s) => ({ ...s, shoppingList: s.shoppingList.filter((i) => i.productId !== productId) }));
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

/** Replaces everything with example data, keeping the user's plan, theme and PIN. */
export function loadDemoData() {
  setState((s) => {
    const demo = createDemoState();
    return { ...demo, settings: { ...demo.settings, theme: s.settings.theme, plan: s.settings.plan, security: s.settings.security } };
  });
  loadDemoSubscriptions();
}

/* ---------- Privacy & security ---------- */

export async function setPin(pin: string) {
  const pinSalt = newSalt();
  const pinHash = await hashPin(pin, pinSalt);
  updateSettings({ security: { pinHash, pinSalt } });
  markSessionUnlocked(true);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const security = ensureState().settings.security;
  if (!security) return true;
  return (await hashPin(pin, security.pinSalt)) === security.pinHash;
}

export function clearPin() {
  setState((s) => ({ ...s, settings: { ...s.settings, security: undefined } }));
  markSessionUnlocked(false);
}

/** Everything the app stores, as pretty JSON for a backup download. */
export function exportDataJson() {
  const { settings, ...data } = ensureState();
  // The PIN hash is useless outside this device; leave it out of backups.
  const { security: _security, ...publicSettings } = settings;
  void _security;
  return JSON.stringify(
    {
      app: "RindeMás",
      exportedAt: new Date().toISOString(),
      ...data,
      settings: publicSettings,
      subscriptions: subscriptionsForExport(),
    },
    null,
    2,
  );
}

/**
 * Permanently deletes every record on this device and starts an empty app
 * (no demo data, Plan Gratuito, default theme, no PIN).
 */
export function wipeAllData() {
  storage.clear();
  legacyStorage.clear();
  wipeSubscriptions();
  markSessionUnlocked(false);
  setState(() => createEmptyState());
}

/* ---------- Theme & plan ---------- */

/** Applies a theme if the current plan allows it. Returns false when PRO is required. */
export function setTheme(theme: ThemeId): boolean {
  if (!canUseTheme(ensureState().settings, theme)) return false;
  updateSettings({ theme });
  return true;
}

/** Starts the 7-day PRO trial (once per device). Optionally applies the theme that prompted it. */
export function startProTrial(theme?: ThemeId): boolean {
  const { plan } = ensureState().settings;
  if (planStatus(plan).isPro) return true;
  if (plan.trialUsed) return false;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86_400_000).toISOString();
  updateSettings({
    plan: { tier: "pro", startedAt: now.toISOString(), trialEndsAt, trialUsed: true },
    ...(theme ? { theme } : {}),
  });
  return true;
}

/** Back to the free plan. PRO themes revert to the default theme. */
export function downgradeToFree() {
  setState((s) => ({
    ...s,
    settings: {
      ...s.settings,
      plan: { tier: "free", trialUsed: s.settings.plan.trialUsed },
      theme: isProTheme(s.settings.theme) ? DEFAULT_THEME : s.settings.theme,
    },
  }));
}
