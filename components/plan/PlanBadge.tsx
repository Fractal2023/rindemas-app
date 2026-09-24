"use client";

import { Crown } from "lucide-react";
import { useAppActions } from "@/components/layout/AppShell";
import { planStatus } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Small pill in the header showing the current plan. Tapping it opens the PRO sheet. */
export function PlanBadge({ className }: { className?: string }) {
  const { settings } = useFinanceState();
  const { openProSheet } = useAppActions();
  const status = planStatus(settings.plan);

  return (
    <button
      type="button"
      onClick={() => openProSheet()}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition",
        status.isPro
          ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-600/30"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-200/70",
        className,
      )}
    >
      {status.isPro && <Crown className="size-3" strokeWidth={2.5} />}
      {status.label}
    </button>
  );
}
