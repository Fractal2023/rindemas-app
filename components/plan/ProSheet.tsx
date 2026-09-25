"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, CalendarClock, Check, Crown, Landmark, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { celebrate } from "@/lib/celebrate";
import { planStatus, PRO_PRICE_MXN, TRIAL_DAYS } from "@/lib/plan";
import { downgradeToFree, startProTrial, useFinanceState } from "@/lib/store";
import { getTheme, THEMES } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";
import { ThemeSwatch } from "./ThemeSwatch";

/** Available today with PRO (plain bullets, no feature icons). */
const BENEFITS = [
  {
    title: "Registro rápido por voz, sin tocar la pantalla",
    text: "Dices “dos jabones de 30 pesos” y el formulario se llena solo.",
  },
  {
    title: "Alertas de vencimiento y links para cancelar a tiempo",
    text: "Te avisamos antes de que una prueba gratis se cobre, con el link para cancelarla.",
  },
  {
    title: "Análisis predictivo de insumos y sugerencias de compra",
    text: "Aprende cada cuánto compras cada producto y te arma la lista antes de que se acabe.",
  },
  {
    title: "Préstamos ilimitados, con recordatorios de pago",
    text: "Registra todos tus préstamos a plazos; te avisamos en la app cuando un pago vence en 3 días o menos.",
  },
];

/** Listed last, after "Próximamente", together with the theme previews. */
const THEMES_BENEFIT = {
  title: "4 temas exclusivos e interfaz sin restricciones",
  text: "Oscuro Neón, Terracota, Azul Ejecutivo y Morado Menta, con todas las funciones desbloqueadas.",
};

/** On the roadmap: shown as "Próximamente", never as available. */
const COMING_SOON = [
  "Alertas de precio personalizadas",
  "Metas de ahorro por quincena",
  "Reportes para descargar en PDF y Excel",
  "Respaldo y familia compartida",
];

/** Which PRO feature brought the user here (highlighted at the top). */
export type ProReason = "voice" | "subscriptions" | "replenishment" | "loans";

interface ProSheetProps {
  open: boolean;
  session: number;
  /** Theme the user tried to pick; applied automatically once PRO is active. */
  pendingTheme?: ThemeId;
  reason?: ProReason;
  onClose: () => void;
}

export function ProSheet({ open, session, pendingTheme, reason, onClose }: ProSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="RindeMás PRO" subtitle="Haz que tu dinero rinda todavía más">
      <ProContent key={session} pendingTheme={pendingTheme} reason={reason} onClose={onClose} />
    </Sheet>
  );
}

function ProContent({ pendingTheme, reason, onClose }: { pendingTheme?: ThemeId; reason?: ProReason; onClose: () => void }) {
  const { settings } = useFinanceState();
  const status = planStatus(settings.plan);
  const [activated, setActivated] = useState(false);
  const [confirmDowngrade, setConfirmDowngrade] = useState(false);
  const wanted = pendingTheme ? getTheme(pendingTheme) : null;

  const start = () => {
    if (!startProTrial(pendingTheme)) return;
    setActivated(true);
    celebrate(true);
    setTimeout(onClose, 1800);
  };

  if (status.isPro && !activated) {
    return (
      <div className="space-y-4 pb-2">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
          <Crown className="size-7" />
          <p className="mt-2 text-lg font-extrabold">Tienes RindeMás PRO</p>
          <p className="text-sm text-white/80">
            {status.onTrial
              ? `Prueba gratis: te quedan ${status.trialDaysLeft} ${status.trialDaysLeft === 1 ? "día" : "días"}.`
              : "Tu suscripción está activa."}
          </p>
        </div>
        <ul className="space-y-2">
          {BENEFITS.slice(0, 3).map((b) => (
            <li key={b.title} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="size-4 text-emerald-600" /> {b.title}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700">
          Listo
        </button>
        {confirmDowngrade ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDowngrade(false)}
              className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                downgradeToFree();
                onClose();
              }}
              className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-bold text-white"
            >
              Sí, volver a Gratuito
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDowngrade(true)} className="w-full py-1 text-xs font-semibold text-slate-400 hover:text-rose-600">
            Volver al Plan Gratuito
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pb-2">
      {/* Promo banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-xl shadow-emerald-700/25">
        <div className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 size-36 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="size-3" /> {TRIAL_DAYS} días de prueba gratis
          </span>
          <p className="mt-3 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Crown className="size-6" /> RindeMás PRO
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tabular-nums">${PRO_PRICE_MXN}</span>
            <span className="text-sm font-semibold text-white/80">MXN / mes</span>
          </p>
          <p className="mt-1 text-xs text-white/80">Menos que un refresco a la semana.</p>
        </div>
      </div>

      {reason === "voice" && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            <Mic className="size-5" />
          </span>
          <p className="text-sm text-slate-700">
            Con PRO anotas tus compras <b className="text-slate-900">hablando</b>: dices el producto y el precio, y solo confirmas.
          </p>
        </div>
      )}

      {reason === "subscriptions" && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            <CalendarClock className="size-5" />
          </span>
          <p className="text-sm text-slate-700">
            Con PRO ves cuánto pagas en <b className="text-slate-900">suscripciones</b> y te avisamos antes de que una prueba gratis
            se convierta en cobro.
          </p>
        </div>
      )}

      {reason === "loans" && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            <Landmark className="size-5" />
          </span>
          <p className="text-sm text-slate-700">
            El plan Gratuito incluye 1 préstamo activo. Con PRO registras <b className="text-slate-900">todos los que tengas</b> y te
            recordamos cada fecha de pago.
          </p>
        </div>
      )}

      {reason === "replenishment" && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            <Brain className="size-5" />
          </span>
          <p className="text-sm text-slate-700">
            Con PRO sabes <b className="text-slate-900">qué se te va a acabar</b> esta semana y lo agregas a tu compra con un toque.
          </p>
        </div>
      )}

      {wanted && (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <ThemeSwatch theme={wanted} className="w-16 shrink-0" />
          <p className="text-sm text-slate-600">
            El tema <b className="text-slate-900">{wanted.name}</b> es exclusivo de PRO. Actívalo con tu prueba gratis.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {BENEFITS.map((b, i) => (
          <motion.li
            key={b.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-start gap-2.5"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={3} />
            <div>
              <p className="text-sm font-bold text-slate-900">{b.title}</p>
              <p className="text-xs text-slate-500">{b.text}</p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Próximamente en PRO</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {COMING_SOON.map((title) => (
            <li key={title} className="flex items-start gap-1.5 text-xs text-slate-500">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
              {title}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2.5">
        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={3} />
        <div>
          <p className="text-sm font-bold text-slate-900">{THEMES_BENEFIT.title}</p>
          <p className="text-xs text-slate-500">{THEMES_BENEFIT.text}</p>
        </div>
      </div>
      <div className="flex justify-center gap-1.5">
        {THEMES.filter((t) => t.tier === "pro").map((t) => (
          <ThemeSwatch key={t.id} theme={t} className="w-14" />
        ))}
      </div>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        Igual que en el plan Gratuito, tus gastos, suscripciones y predicciones se calculan y guardan en tu celular. La voz se
        procesa en el celular cuando tu navegador lo permite; si no, te avisamos antes de usar el dictado en línea.
      </p>

      {status.canStartTrial ? (
        <>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={start}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
          >
            Comenzar {TRIAL_DAYS} días gratis
          </motion.button>
          <p className="text-center text-[11px] text-slate-400">
            Después ${PRO_PRICE_MXN} MXN al mes. Cancela cuando quieras desde Ajustes.
          </p>
        </>
      ) : (
        <>
          <button disabled className="w-full rounded-2xl bg-slate-100 py-4 text-base font-bold text-slate-400">
            Suscripción disponible muy pronto
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Tu prueba gratis de {TRIAL_DAYS} días ya terminó. Te avisaremos cuando puedas suscribirte.
          </p>
        </>
      )}
      <button onClick={onClose} className="w-full py-1 text-sm font-semibold text-slate-500">
        Ahora no
      </button>

      <AnimatePresence>
        {activated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl"
            >
              <Crown className="size-9" />
            </motion.div>
            <p className="text-xl font-extrabold text-slate-900">¡Bienvenido a PRO!</p>
            <p className="text-sm text-slate-500">
              {wanted ? `Tema ${wanted.name} activado. ` : ""}Disfruta {TRIAL_DAYS} días gratis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
