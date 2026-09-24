import { DEFAULT_THEME, isProTheme } from "./themes";
import type { PlanState, Settings, ThemeId } from "./types";

export const PRO_PRICE_MXN = 59;
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
