"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FileText, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  cancelSubscription,
  deadlineLabel,
  deleteSubscription,
  keepTrial,
  nextChargeDate,
  parseCancelInfo,
  parseLocalDate,
  reactivateSubscription,
  trialAlert,
  type Subscription,
  type TrialAlert,
} from "@/lib/subscriptions";
import { cn, formatMXN, initials, shortDate } from "@/lib/utils";
import { NewSubscriptionSheet } from "./NewSubscriptionSheet";

const ALERT_STYLE: Record<TrialAlert, { ring: string; pill: string }> = {
  ok: { ring: "ring-slate-100", pill: "bg-emerald-50 text-emerald-700" },
  warning: { ring: "ring-amber-300", pill: "bg-amber-100 text-amber-800" },
  critical: { ring: "ring-rose-300", pill: "bg-rose-100 text-rose-700" },
  expired: { ring: "ring-slate-200", pill: "bg-slate-100 text-slate-500" },
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function billingLabel(s: Subscription) {
  return s.frequency === "anual"
    ? `${formatMXN(s.amount)}/año · cobra el ${s.billingDay} de ${MONTHS[(s.billingMonth ?? 1) - 1]}`
    : `${formatMXN(s.amount)}/mes · cobra el día ${s.billingDay}`;
}

export function SubscriptionCard({ sub }: { sub: Subscription }) {
  const [showNote, setShowNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editSheet, setEditSheet] = useState({ open: false, session: 0 });
  const cancelled = sub.status === "cancelada";
  const alert = trialAlert(sub);
  const style = sub.isTrial && !cancelled ? ALERT_STYLE[alert.level] : ALERT_STYLE.ok;
  const { link, note } = parseCancelInfo(sub.cancelInfo);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "rounded-3xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] ring-1",
        style.ring,
        sub.isTrial && !cancelled && alert.level !== "ok" && "ring-2",
        cancelled && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-sm font-extrabold text-slate-600">
          {initials(sub.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-bold text-slate-900", cancelled && "line-through decoration-slate-300")}>{sub.name}</p>
          <p className="text-xs text-slate-500">{billingLabel(sub)}</p>
          {!cancelled && !sub.isTrial && (
            <p className="text-xs text-slate-500">Próximo cobro: {shortDate(nextChargeDate(sub).toISOString())}</p>
          )}
          {cancelled && sub.cancelledAt && (
            <p className="text-xs text-slate-500">Cancelada el {shortDate(sub.cancelledAt)}</p>
          )}
        </div>
        <p className="text-right font-extrabold text-slate-900 tabular-nums">
          {formatMXN(sub.amount)}
          <span className="block text-[11px] font-medium text-slate-400">{sub.frequency === "anual" ? "al año" : "al mes"}</span>
        </p>
      </div>

      {sub.isTrial && !cancelled && sub.cancelBy && alert.daysLeft !== undefined && (
        <div className={cn("mt-3 flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs font-semibold", style.pill)}>
          <span>
            {alert.level === "critical" ? "🔴" : alert.level === "warning" ? "🟡" : alert.level === "expired" ? "⚪" : "🟢"}{" "}
            {deadlineLabel(alert.daysLeft)}
          </span>
          <span className="font-medium opacity-80">Límite: {shortDate(parseLocalDate(sub.cancelBy).toISOString())}</span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {showNote && note && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
          >
            <b className="text-slate-800">Cómo cancelar:</b> {note}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap gap-2">
        {!cancelled && link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
          >
            <ExternalLink className="size-3.5" /> Ir a cancelar
          </a>
        )}
        {!cancelled && note && (
          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold",
              link ? "bg-slate-100 text-slate-700" : "bg-rose-600 text-white hover:bg-rose-700",
            )}
          >
            <FileText className="size-3.5" /> {link ? "Ver nota" : showNote ? "Ocultar pasos" : "Ir a cancelar"}
          </button>
        )}
        {!cancelled && (
          <button
            type="button"
            onClick={() => cancelSubscription(sub.id)}
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Ya la cancelé
          </button>
        )}
        {!cancelled && sub.isTrial && (
          <button
            type="button"
            onClick={() => keepTrial(sub.id)}
            className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Me la quedo
          </button>
        )}
        {cancelled && (
          <button
            type="button"
            onClick={() => reactivateSubscription(sub.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            <RotateCcw className="size-3.5" /> Reactivar
          </button>
        )}
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditSheet((e) => ({ open: true, session: e.session + 1 }))}
            aria-label={`Editar ${sub.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Eliminar ${sub.name}`}
            className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100">
          <p className="flex-1 text-xs text-rose-800">
            ¿Eliminar <b>{sub.name}</b>? No se puede deshacer.
          </p>
          <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => deleteSubscription(sub.id)}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      )}

      <NewSubscriptionSheet
        open={editSheet.open}
        session={editSheet.session}
        editing={sub}
        onClose={() => setEditSheet((e) => ({ ...e, open: false }))}
      />
    </motion.li>
  );
}
