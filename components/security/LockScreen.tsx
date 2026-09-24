"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { markSessionUnlocked } from "@/lib/security";
import { verifyPin, wipeAllData } from "@/lib/store";
import { PinPad } from "./PinPad";

/** Full-screen gate shown when a PIN is set and this session hasn't been unlocked yet. */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-dvh flex-col items-center px-6 pt-10 pb-8"
    >
      <BrandLogo showSlogan={false} />
      <div className="mt-10 grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Lock className="size-6" />
      </div>
      <h1 className="mt-4 text-xl font-extrabold text-slate-900">Ingresa tu PIN</h1>
      <p className="text-sm text-slate-500">Tus finanzas están protegidas</p>

      <div className="mt-4 w-full">
        <PinPad
          error={error}
          onComplete={async (pin) => {
            if (await verifyPin(pin)) {
              markSessionUnlocked(true);
              onUnlock();
              return true;
            }
            setError("PIN incorrecto");
            return false;
          }}
        />
      </div>

      <div className="mt-auto pt-8 text-center">
        {forgot ? (
          <div className="max-w-72 space-y-2">
            <p className="text-xs text-slate-500">
              El PIN no se puede recuperar. Para volver a entrar hay que borrar todos los datos de este dispositivo.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setForgot(false)} className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-600">
                Cancelar
              </button>
              <button
                onClick={() => {
                  wipeAllData();
                  onUnlock();
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-bold text-white"
              >
                Borrar todo
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setForgot(true)} className="text-sm font-semibold text-slate-400 hover:text-slate-600">
            ¿Olvidaste tu PIN?
          </button>
        )}
      </div>
    </motion.div>
  );
}
