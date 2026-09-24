"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:opacity-50",
        checked ? "justify-end bg-emerald-600" : "justify-start bg-slate-200",
      )}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 34 }} className="size-6 rounded-full bg-white shadow" />
    </button>
  );
}
