"use client";

import { ChevronRight, Crown, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useAppActions } from "@/components/layout/AppShell";
import { ThemePicker } from "@/components/plan/ThemePicker";
import { PrivacySecurityCard } from "@/components/security/PrivacySecurityCard";
import { BRAND } from "@/components/ui/BrandLogo";
import { Sheet } from "@/components/ui/Sheet";
import { planStatus, PRO_PRICE_MXN } from "@/lib/plan";
import { loadDemoData, updateSettings, useFinanceState } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SettingsSheet({ open, session, onClose }: { open: boolean; session: number; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Ajustes" subtitle="Tus datos se guardan solo en este dispositivo">
      <SettingsForm key={session} onClose={onClose} />
    </Sheet>
  );
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const { settings } = useFinanceState();
  const { openProSheet } = useAppActions();
  const status = planStatus(settings.plan);
  const [name, setName] = useState(settings.familyName);
  const [income, setIncome] = useState(String(settings.weeklyIncome));
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    const weeklyIncome = Number(income);
    updateSettings({
      familyName: name.trim() || settings.familyName,
      weeklyIncome: Number.isFinite(weeklyIncome) && weeklyIncome >= 0 ? weeklyIncome : settings.weeklyIncome,
    });
    onClose();
  };

  return (
    <div className="space-y-4 pb-2">
      <button
        type="button"
        onClick={() => openProSheet()}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition",
          status.isPro
            ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white"
            : "bg-emerald-50 ring-1 ring-emerald-100 hover:bg-emerald-100/70",
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            status.isPro ? "bg-white/20" : "bg-emerald-600 text-white",
          )}
        >
          <Crown className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-bold", !status.isPro && "text-slate-900")}>
            {status.isPro ? "RindeMás PRO" : "Plan Gratuito"}
          </span>
          <span className={cn("block text-xs", status.isPro ? "text-white/80" : "text-slate-500")}>
            {status.onTrial
              ? `Prueba gratis · quedan ${status.trialDaysLeft} ${status.trialDaysLeft === 1 ? "día" : "días"}`
              : status.isPro
                ? "Suscripción activa"
                : `Mejora a PRO por $${PRO_PRICE_MXN} MXN/mes`}
          </span>
        </span>
        <ChevronRight className={cn("size-4", status.isPro ? "text-white/70" : "text-emerald-600")} />
      </button>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">Tema visual</p>
        <ThemePicker />
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-slate-500">Nombre de la familia</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-500">Ingreso semanal estimado (MXN)</span>
        <input
          value={income}
          onChange={(e) => setIncome(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </label>
      <button onClick={save} className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white">
        Guardar
      </button>

      <PrivacySecurityCard onWiped={onClose} />

      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-800">Datos de ejemplo</p>
        <p className="mt-0.5 text-xs text-slate-500">
          ¿Quieres ver cómo se ve la app con datos? Carga una familia de ejemplo. Reemplaza lo que tengas registrado.
        </p>
        {confirmReset ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-xl bg-white py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                loadDemoData();
                onClose();
              }}
              className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-bold text-white"
            >
              Sí, reemplazar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-3 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100"
          >
            <RotateCcw className="size-4" /> Cargar datos de ejemplo
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        {BRAND.domain} · {BRAND.slogan}
      </p>
    </div>
  );
}
