import { DEFAULT_THEME, isProTheme } from "./themes";
import type { BillingPeriod, PlanState, Settings, ThemeId } from "./types";

/** Monthly price; also the reference for every discount below. */
export const PRO_PRICE_MXN = 59;

export interface BillingOption {
  id: BillingPeriod;
  label: string;
  /** Total charged per period, MXN. */
  price: number;
  months: number;
  /** "/mes", "/ 3 meses"… */
  per: string;
  /** "al mes", "cada 3 meses"… for sentences. */
  every: string;
}

export const BILLING_OPTIONS: BillingOption[] = [
  { id: "mensual", label: "Mensual", price: 59, months: 1, per: "/mes", every: "al mes" },
  { id: "trimestral", label: "Trimestral", price: 149, months: 3, per: "/ 3 meses", every: "cada 3 meses" },
  { id: "semestral", label: "Semestral", price: 269, months: 6, per: "/ 6 meses", every: "cada 6 meses" },
  { id: "anual", label: "Anual", price: 499, months: 12, per: "/año", every: "al año" },
];

export const DEFAULT_BILLING: BillingPeriod = "anual";

export const billingOption = (id: BillingPeriod | undefined) => BILLING_OPTIONS.find((o) => o.id === id) ?? BILLING_OPTIONS[0];

/** Real saving vs. paying monthly, rounded down so we never overstate it. */
export function savingsPct(o: BillingOption) {
  const full = PRO_PRICE_MXN * o.months;
  return Math.floor(((full - o.price) / full) * 100);
}

/** Months you'd pay monthly for the same money, minus the plan's months: whole free months (rounded down). */
export const freeMonths = (o: BillingOption) => Math.floor(o.months - o.price / PRO_PRICE_MXN);

/** Short promo tag: "Ahorra 15%", or "2 meses GRATIS" for the yearly plan. */
export function billingBadge(o: BillingOption): string | null {
  if (o.id === "mensual") return null;
  if (o.id === "anual") return `${Math.min(2, freeMonths(o))} meses GRATIS`;
  return `Ahorra ${savingsPct(o)}%`;
}

export const monthlyEquivalent = (o: BillingOption) => Math.round((o.price / o.months) * 100) / 100;
export const TRIAL_DAYS = 7;

export const FREE_PLAN: PlanState = { tier: "free" };

export interface PlanStatus {
  isPro: boolean;
  onTrial: boolean;
  trialDaysLeft: number;
  /** Trial was used and has ended without a paid subscription. */
  trialExpired: boolean;
  canStartTrial: boolean;
  label: string;
}

export function planStatus(plan: PlanState, now = new Date()): PlanStatus {
  const trialEnd = plan.trialEndsAt ? new Date(plan.trialEndsAt) : null;
  const onTrial = plan.tier === "pro" && !!trialEnd && trialEnd > now;
  const isPro = plan.tier === "pro" && (!trialEnd || onTrial);
  const trialExpired = plan.tier === "pro" && !!trialEnd && trialEnd <= now;
  const trialDaysLeft = onTrial ? Math.max(1, Math.ceil((trialEnd!.getTime() - now.getTime()) / 86_400_000)) : 0;
  return {
    isPro,
    onTrial,
    trialDaysLeft,
    trialExpired,
    canStartTrial: !plan.trialUsed,
    label: isPro ? "RindeMás PRO" : "Plan Gratuito",
  };
}

/** Theme actually shown: PRO themes fall back to the default when the plan doesn't allow them. */
export function effectiveTheme(settings: Settings, now = new Date()): ThemeId {
  if (isProTheme(settings.theme) && !planStatus(settings.plan, now).isPro) return DEFAULT_THEME;
  return settings.theme;
}

export function canUseTheme(settings: Settings, theme: ThemeId, now = new Date()) {
  return !isProTheme(theme) || planStatus(settings.plan, now).isPro;
}
