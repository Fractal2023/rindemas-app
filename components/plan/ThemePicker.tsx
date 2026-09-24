"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useAppActions } from "@/components/layout/AppShell";
import { canUseTheme, effectiveTheme } from "@/lib/plan";
import { setTheme, useFinanceState } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ThemeSwatch } from "./ThemeSwatch";

/** Theme grid for Ajustes. Locked PRO themes open the PRO sheet instead of applying. */
export function ThemePicker() {
  const { settings } = useFinanceState();
  const { openProSheet } = useAppActions();
  const active = effectiveTheme(settings);

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEMES.map((t) => {
        const selected = t.id === active;
        const locked = !canUseTheme(settings, t.id);
        return (
          <motion.button
            key={t.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => (locked ? openProSheet(t.id) : setTheme(t.id))}
            aria-pressed={selected}
            aria-label={`${t.name}${locked ? " (PRO)" : ""}`}
            className={cn(
              "relative rounded-2xl p-1.5 text-left transition",
              selected ? "bg-emerald-50 ring-2 ring-emerald-600" : "bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300",
            )}
          >
            <ThemeSwatch theme={t} className={cn(locked && "opacity-80")} />
            <p className="mt-1.5 truncate px-0.5 text-[11px] font-bold text-slate-800">{t.name}</p>
            <p className="px-0.5 text-[10px] font-semibold text-slate-400">{t.tier === "pro" ? "PRO" : "Gratis"}</p>
            {selected && (
              <span className="absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full bg-emerald-600 text-white shadow">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            {locked && (
              <span className="absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full bg-black/60 text-white">
                <Lock className="size-2.5" strokeWidth={3} />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
