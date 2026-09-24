"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Delete } from "lucide-react";
import { useEffect, useState } from "react";
import { PIN_LENGTH } from "@/lib/security";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

interface PinPadProps {
  /** Called with the full PIN. Return false (or a promise of false) to shake and clear. */
  onComplete: (pin: string) => boolean | Promise<boolean>;
  error?: string | null;
}

/** 4-dot PIN entry with a numeric keypad. Also accepts the physical keyboard. */
export function PinPad({ onComplete, error }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const controls = useAnimationControls();

  const press = async (key: string) => {
    if (busy) return;
    if (key === "del") return setPin((p) => p.slice(0, -1));
    if (!/^\d$/.test(key) || pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setBusy(true);
      const ok = await onComplete(next);
      if (!ok) {
        await controls.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.35 } });
      }
      setPin("");
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center">
      <motion.div animate={controls} className="flex gap-4 py-4" aria-label={`${pin.length} de ${PIN_LENGTH} dígitos`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <motion.span
            key={i}
            animate={{ scale: i < pin.length ? 1.15 : 1 }}
            className={cn(
              "size-4 rounded-full transition-colors",
              i < pin.length ? "bg-emerald-600" : "bg-slate-200",
              error && "bg-rose-600/60",
            )}
          />
        ))}
      </motion.div>
      <p className={cn("h-5 text-sm font-semibold text-rose-600", !error && "invisible")} role="alert">
        {error}
      </p>
      <div className="mt-3 grid w-full max-w-72 grid-cols-3 gap-3">
        {KEYS.map((k) =>
          k === "" ? (
            <span key="spacer" />
          ) : (
            <motion.button
              key={k}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Borrar" : k}
              className="h-15 rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-800 select-none hover:bg-slate-200"
            >
              {k === "del" ? <Delete className="mx-auto size-5" /> : k}
            </motion.button>
          ),
        )}
      </div>
    </div>
  );
}
