"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Switch";
import { addSubscription, toYmd, type SubscriptionFrequency } from "@/lib/subscriptions";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const field =
  "w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400";
const label = "mb-1 block text-xs font-semibold text-slate-500";

export function NewSubscriptionSheet({ open, session, onClose }: { open: boolean; session: number; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Nueva suscripción" subtitle="Streaming, música, apps, membresías…">
      <NewSubscriptionForm key={session} onClose={onClose} />
    </Sheet>
  );
}

function NewSubscriptionForm({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("mensual");
  const [billingDay, setBillingDay] = useState(String(now.getDate()));
  const [billingMonth, setBillingMonth] = useState(String(now.getMonth() + 1));
  const [isTrial, setIsTrial] = useState(false);
  const [cancelBy, setCancelBy] = useState("");
  const [cancelInfo, setCancelInfo] = useState("");

  const day = Number(billingDay);
  const errors = {
    name: name.trim().length < 2,
    amount: !(Number(amount) > 0),
    day: !(Number.isInteger(day) && day >= 1 && day <= 31),
    cancelBy: isTrial && !cancelBy,
  };
  const valid = !Object.values(errors).some(Boolean);

  const toggleTrial = (on: boolean) => {
    setIsTrial(on);
    // Most free trials last 7 days: suggest a deadline the user can adjust.
    if (on && !cancelBy) setCancelBy(toYmd(new Date(now.getTime() + 6 * 86_400_000)));
  };

  return (
    <form
      className="space-y-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        addSubscription({
          name,
          amount: Number(amount),
          frequency,
          billingDay: day,
          billingMonth: frequency === "anual" ? Number(billingMonth) : undefined,
          isTrial,
          cancelBy: cancelBy || undefined,
          cancelInfo,
        });
        onClose();
      }}
    >
      <div>
        <label className={label} htmlFor="sub-name">
          Nombre del servicio
        </label>
        <input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Netflix, Spotify, gimnasio" className={field} />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={label} htmlFor="sub-amount">
            Monto (MXN)
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-slate-400">$</span>
            <input
              id="sub-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              className={`${field} pl-8 text-base font-bold tabular-nums`}
            />
          </div>
        </div>
        <div className="flex-1">
          <span className={label}>Frecuencia</span>
          <SegmentedControl
            id="sub-frequency"
            value={frequency}
            onChange={setFrequency}
            options={[
              { value: "mensual", label: "Mensual" },
              { value: "anual", label: "Anual" },
            ]}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-28">
          <label className={label} htmlFor="sub-day">
            Día de cobro
          </label>
          <input
            id="sub-day"
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            className={`${field} tabular-nums`}
            aria-invalid={errors.day}
          />
        </div>
        {frequency === "anual" && (
          <div className="flex-1">
            <label className={label} htmlFor="sub-month">
              Mes de cobro
            </label>
            <select id="sub-month" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className={field}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {errors.day && billingDay !== "" && <p className="-mt-2 text-xs font-semibold text-rose-600">Escribe un día entre 1 y 31.</p>}

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">¿Es prueba gratis (Free Trial)?</p>
          <p className="text-xs text-slate-500">Te avisamos antes de que se cobre</p>
        </div>
        <Switch label="Es prueba gratis" checked={isTrial} onChange={toggleTrial} />
      </div>

      <div>
        <label className={label} htmlFor="sub-cancel-by">
          Fecha límite de cancelación {isTrial ? "" : "(opcional)"}
        </label>
        <input id="sub-cancel-by" type="date" value={cancelBy} onChange={(e) => setCancelBy(e.target.value)} className={field} />
        {errors.cancelBy && <p className="mt-1 text-xs font-semibold text-rose-600">Las pruebas gratis necesitan fecha límite.</p>}
      </div>

      <div>
        <label className={label} htmlFor="sub-cancel-info">
          Link o nota de cancelación (opcional)
        </label>
        <input
          id="sub-cancel-info"
          value={cancelInfo}
          onChange={(e) => setCancelInfo(e.target.value)}
          placeholder="https://… o “Cuenta → Membresía → Cancelar”"
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
      >
        Guardar suscripción
      </button>
    </form>
  );
}
