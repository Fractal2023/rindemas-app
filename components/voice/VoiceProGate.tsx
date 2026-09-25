"use client";

import { motion } from "framer-motion";
import { Crown, Mic } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { planStatus, PRO_PRICE_MXN, TRIAL_DAYS } from "@/lib/plan";
import { useFinanceState } from "@/lib/store";

interface VoiceProGateProps {
  open: boolean;
  onClose: () => void;
  /** Opens the RindeMás PRO plans sheet. */
  onSeePlans: () => void;
}

/** Shown when a Plan Gratuito user taps a mic: voice entry is a PRO feature. */
export function VoiceProGate({ open, onClose, onSeePlans }: VoiceProGateProps) {
  const { settings } = useFinanceState();
  const { canStartTrial } = planStatus(settings.plan);

  return (
    <Sheet open={open} onClose={onClose} title="Registro por voz" subtitle="Función de RindeMás PRO">
      <div className="space-y-5 pb-2 text-center">
        <div className="relative mx-auto grid size-24 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-400/25"
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/30">
            <Mic className="size-9" />
          </span>
          <span className="absolute -top-1 -right-1 grid size-8 place-items-center rounded-full bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100">
            <Crown className="size-4" />
          </span>
        </div>

        <p className="mx-auto max-w-xs text-lg leading-snug font-extrabold text-slate-900">
          🎙️ El registro por voz es una función exclusiva de RindeMás PRO. ¡Suscríbete para ahorrar tiempo en el súper!
        </p>

        {/* What it feels like */}
        <div className="mx-auto max-w-xs space-y-2 text-left">
          <p className="w-fit rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm text-slate-700">“dos jabones de 30 pesos”</p>
          <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
            Jabón de tocador · 2 × $30 = $60 ✓
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onSeePlans}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
          >
            Ver RindeMás PRO
          </button>
          <p className="mt-2 text-xs text-slate-500">
            {canStartTrial ? `${TRIAL_DAYS} días gratis, después $${PRO_PRICE_MXN} MXN al mes` : `$${PRO_PRICE_MXN} MXN al mes`}
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">
          Ahora no
        </button>
      </div>
    </Sheet>
  );
}
