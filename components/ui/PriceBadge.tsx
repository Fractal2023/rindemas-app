import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Trend } from "@/lib/selectors";
import { cn, formatPct } from "@/lib/utils";

const STYLES: Record<Trend, string> = {
  up: "bg-rose-50 text-rose-600 ring-rose-100",
  down: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  flat: "bg-slate-100 text-slate-500 ring-slate-200",
};

const ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function PriceBadge({ trend, pct, className }: { trend: Trend; pct: number; className?: string }) {
  const Icon = ICONS[trend];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ring-1",
        STYLES[trend],
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      {trend === "flat" ? "0%" : formatPct(pct)}
    </span>
  );
}
