"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

/** Applies a keypad key to an amount string, keeping max 2 decimals and 7 integer digits. */
export function applyKey(value: string, key: string): string {
  if (key === "del") return value.slice(0, -1);
  if (key === ".") return value.includes(".") ? value : (value || "0") + ".";
  const [int, dec] = value.split(".");
  if (dec !== undefined && dec.length >= 2) return value;
  if (dec === undefined && int.length >= 7) return value;
  if (value === "0") return key;
  return value + key;
}

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  /** Also listen to the physical keyboard (digits, dot, backspace). */
  captureKeyboard?: boolean;
  className?: string;
}

export function NumericKeypad({ value, onChange, captureKeyboard, className }: NumericKeypadProps) {
  useEffect(() => {
    if (!captureKeyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (/^[0-9]$/.test(e.key)) onChange(applyKey(value, e.key));
      else if (e.key === "." || e.key === ",") onChange(applyKey(value, "."));
      else if (e.key === "Backspace") onChange(applyKey(value, "del"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [captureKeyboard, value, onChange]);

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {KEYS.map((k) => (
        <motion.button
          key={k}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(applyKey(value, k))}
          className="h-13 rounded-2xl bg-slate-100 text-xl font-semibold text-slate-800 transition-colors select-none hover:bg-slate-200 active:bg-slate-200"
          aria-label={k === "del" ? "Borrar" : k}
        >
          {k === "del" ? <Delete className="mx-auto size-5" /> : k}
        </motion.button>
      ))}
    </div>
  );
}

export function AmountDisplay({ value, className }: { value: string; className?: string }) {
  const [int, dec] = (value || "0").split(".");
  const intFormatted = Number(int || 0).toLocaleString("es-MX");
  return (
    <div className={cn("flex items-baseline justify-center gap-1 font-bold tracking-tight text-slate-900", className)}>
      <span className="text-3xl text-slate-400">$</span>
      <motion.span
        key={value.length}
        initial={{ scale: 0.94, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.12 }}
        className={cn("text-5xl tabular-nums", !value && "text-slate-300")}
      >
        {intFormatted}
        {dec !== undefined && <span className="text-slate-400">.{dec}</span>}
      </motion.span>
    </div>
  );
}
