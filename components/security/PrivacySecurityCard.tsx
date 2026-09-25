"use client";

import { Fingerprint, Mic, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { updateSettings, useFinanceState } from "@/lib/store";
import { DataControlsSheet } from "./DataControlsSheet";
import { PinSheet, type PinSheetMode } from "./PinSheet";

/** "Privacidad y Seguridad" block inside Ajustes. */
export function PrivacySecurityCard({ onWiped }: { onWiped: () => void }) {
  const { settings } = useFinanceState();
  const pinEnabled = !!settings.security;

  const [pinSheet, setPinSheet] = useState<{ open: boolean; mode: PinSheetMode; session: number }>({
    open: false,
    mode: "create",
    session: 0,
  });
  const [dataSheet, setDataSheet] = useState({ open: false, session: 0 });

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-col items-start gap-2">
        <h3 className="text-sm font-bold text-slate-900">Privacidad y Seguridad</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
          <ShieldCheck className="size-3.5" />
          Datos privados · solo en tu celular
        </span>
      </div>

      <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
        <Smartphone className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-slate-600">
          En RindeMás tus finanzas son confidenciales. Tus registros de compras y deudas se guardan{" "}
          <b className="text-slate-800">únicamente en este dispositivo</b>: no se envían a ningún servidor, no se comparten con
          terceros y nadie de RindeMás puede verlos. Si borras los datos del navegador se pierden, así que descarga un respaldo de
          vez en cuando.
        </p>
      </div>
      <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
        <Mic className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-slate-600">
          <b className="text-slate-800">Dictado por voz:</b> si tu navegador puede reconocer voz dentro del celular, el audio no sale
          de él. Si no, el dictado usa el servicio de voz del navegador (Google o Apple) por internet, y siempre te lo avisamos antes.
          {settings.voiceCloudConsent && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => updateSettings({ voiceCloudConsent: false })}
                className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                Volver a preguntarme
              </button>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 py-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Fingerprint className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Bloqueo por PIN / Biometría</p>
          <p className="text-xs text-slate-500">
            {pinEnabled ? "Activo · se pide al abrir la app" : "PIN de 4 dígitos · biometría muy pronto"}
          </p>
        </div>
        <Switch
          label="Bloqueo por PIN"
          checked={pinEnabled}
          onChange={(on) => setPinSheet((s) => ({ open: true, mode: on ? "create" : "disable", session: s.session + 1 }))}
        />
      </div>

      <button
        type="button"
        onClick={() => setDataSheet((s) => ({ open: true, session: s.session + 1 }))}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700"
      >
        <Trash2 className="size-4" />
        Exportar o Eliminar definitivamente mis datos
      </button>

      <PinSheet {...pinSheet} onClose={() => setPinSheet((s) => ({ ...s, open: false }))} />
      <DataControlsSheet
        {...dataSheet}
        onClose={() => setDataSheet((s) => ({ ...s, open: false }))}
        onWiped={() => {
          setDataSheet((s) => ({ ...s, open: false }));
          onWiped();
        }}
      />
    </section>
  );
}
