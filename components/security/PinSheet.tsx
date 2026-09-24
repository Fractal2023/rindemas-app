"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { clearPin, setPin, verifyPin } from "@/lib/store";
import { PinPad } from "./PinPad";

export type PinSheetMode = "create" | "disable";

interface PinSheetProps {
  open: boolean;
  session: number;
  mode: PinSheetMode;
  onClose: () => void;
}

export function PinSheet({ open, session, mode, onClose }: PinSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear PIN" : "Desactivar bloqueo"}
      subtitle={mode === "create" ? "Se pedirá cada vez que abras RindeMás" : "Confirma tu PIN actual"}
    >
      {mode === "create" ? <CreatePin key={session} onDone={onClose} /> : <DisablePin key={session} onDone={onClose} />}
    </Sheet>
  );
}

function CreatePin({ onDone }: { onDone: () => void }) {
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="pb-4 text-center">
      <p className="text-sm font-semibold text-slate-700">{first ? "Vuelve a escribirlo para confirmar" : "Elige un PIN de 4 dígitos"}</p>
      <PinPad
        key={first ? "confirm" : "first"}
        error={error}
        onComplete={async (pin) => {
          if (!first) {
            setFirst(pin);
            setError(null);
            return true;
          }
          if (pin !== first) {
            setFirst(null);
            setError("Los PIN no coinciden, intenta de nuevo");
            return false;
          }
          await setPin(pin);
          onDone();
          return true;
        }}
      />
    </div>
  );
}

function DisablePin({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="pb-4">
      <PinPad
        error={error}
        onComplete={async (pin) => {
          if (await verifyPin(pin)) {
            clearPin();
            onDone();
            return true;
          }
          setError("PIN incorrecto");
          return false;
        }}
      />
    </div>
  );
}
