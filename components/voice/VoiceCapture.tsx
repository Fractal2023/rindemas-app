"use client";

import { motion } from "framer-motion";
import { CloudDownload, Globe, Mic, MicOff, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateSettings, useFinanceState } from "@/lib/store";
import { parsePurchase, type ParsedPurchase } from "@/lib/voice/parsePurchase";
import { installOnDevice, isSpeechSupported, listen, onDeviceStatus, voiceErrorMessage } from "@/lib/voice/speech";
import { cn } from "@/lib/utils";

type Phase = "checking" | "offer-download" | "downloading" | "consent" | "listening" | "error";
type Mode = "local" | "cloud";

interface VoiceCaptureProps {
  onResult: (parsed: ParsedPurchase) => void;
  onCancel: () => void;
}

/**
 * Dictation overlay for the quick-add form. Prefers on-device recognition
 * (offline, audio never leaves the phone); otherwise asks once before using
 * the browser's online speech service.
 */
export function VoiceCapture({ onResult, onCancel }: VoiceCaptureProps) {
  const { products, settings } = useFinanceState();
  const [phase, setPhase] = useState<Phase>("checking");
  const [mode, setMode] = useState<Mode>("local");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);
  const gotResult = useRef(false);
  const consentRef = useRef(!!settings.voiceCloudConsent);

  const fail = (code: string) => {
    const msg = voiceErrorMessage(code);
    if (!msg) return onCancel();
    setError(msg);
    setPhase("error");
  };

  const begin = (m: Mode) => {
    setMode(m);
    setInterim("");
    setError("");
    setPhase("listening");
    gotResult.current = false;
    let failed = false;
    stopRef.current = listen({
      processLocally: m === "local",
      onInterim: setInterim,
      onResult: (alternatives) => {
        gotResult.current = true;
        const parsed = alternatives.map((a) => parsePurchase(a, products));
        onResult(parsed.find((p) => p.total && p.productName) ?? parsed[0]);
      },
      onError: (code) => {
        failed = true;
        fail(code);
      },
      onEnd: () => {
        stopRef.current = null;
        if (!gotResult.current && !failed) fail("no-speech");
      },
    });
  };

  const startCloud = () => {
    if (!consentRef.current) return setPhase("consent");
    if (!navigator.onLine) return fail("network");
    begin("cloud");
  };

  const closed = useRef(false);

  const start = async () => {
    // Always await first, so no state changes happen synchronously when called from the effect.
    const status = await (isSpeechSupported() ? onDeviceStatus() : Promise.resolve(null));
    if (closed.current) return;
    if (status === null) fail("not-supported");
    else if (status === "available") begin("local");
    else if (status === "downloadable") setPhase("offer-download");
    else if (status === "downloading") setPhase("downloading");
    else startCloud();
  };

  const download = async () => {
    setPhase("downloading");
    if (await installOnDevice()) begin("local");
    else startCloud();
  };

  useEffect(() => {
    closed.current = false;
    // Kick off in a callback (like a subscription) rather than in the effect body itself.
    const timer = setTimeout(() => void start(), 0);
    return () => {
      closed.current = true;
      clearTimeout(timer);
      stopRef.current?.();
    };
    // Start once when the overlay opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/97 px-2 text-center"
      role="dialog"
      aria-label="Registro por voz"
    >
      <button
        type="button"
        onClick={() => {
          stopRef.current?.();
          onCancel();
        }}
        className="absolute top-0 right-0 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500"
        aria-label="Cerrar dictado"
      >
        <X className="size-4" />
      </button>

      {phase === "listening" && (
        <>
          <div className="relative grid size-24 place-items-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400/30"
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative grid size-20 place-items-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40">
              <Mic className="size-9" />
            </span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900">Escuchando…</p>
            <p className="mt-1 text-sm text-slate-500">
              Di por ejemplo <b className="text-slate-700">“Papel de baño 85 pesos”</b> o{" "}
              <b className="text-slate-700">“dos jabones de 30 pesos”</b>
            </p>
          </div>
          <p className={cn("min-h-6 max-w-xs text-base font-semibold text-emerald-700", !interim && "text-slate-300")}>
            {interim || "…"}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              mode === "local" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
            )}
          >
            {mode === "local" ? <ShieldCheck className="size-3.5" /> : <Globe className="size-3.5" />}
            {mode === "local" ? "Sin internet · se procesa en tu celular" : "Dictado en línea del navegador"}
          </span>
          <button
            type="button"
            onClick={() => stopRef.current?.()}
            className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white"
          >
            Listo
          </button>
        </>
      )}

      {phase === "checking" && <p className="text-sm font-semibold text-slate-500">Preparando el micrófono…</p>}

      {(phase === "offer-download" || phase === "downloading") && (
        <>
          <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CloudDownload className="size-8" />
          </span>
          <div className="max-w-xs">
            <p className="text-lg font-extrabold text-slate-900">
              {phase === "downloading" ? "Descargando voz en español…" : "Dicta sin internet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tu navegador puede reconocer tu voz dentro del celular, sin mandar el audio a ningún lado. Solo necesita descargar
              el español una vez.
            </p>
          </div>
          {phase === "offer-download" && (
            <button
              type="button"
              onClick={() => void download()}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Descargar voz en español
            </button>
          )}
          <button type="button" onClick={startCloud} className="text-sm font-semibold text-slate-500 underline-offset-2 hover:underline">
            Usar el dictado en línea mientras tanto
          </button>
        </>
      )}

      {phase === "consent" && (
        <>
          <span className="grid size-16 place-items-center rounded-full bg-slate-100 text-slate-600">
            <Globe className="size-8" />
          </span>
          <div className="max-w-xs">
            <p className="text-lg font-extrabold text-slate-900">Dictado en línea</p>
            <p className="mt-1 text-sm text-slate-500">
              En este navegador, el audio de lo que dictes lo convierte en texto el servicio de voz del navegador (Google o Apple)
              y necesita internet. Tus gastos y deudas siguen guardados solo en tu celular.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              consentRef.current = true;
              updateSettings({ voiceCloudConsent: true });
              startCloud();
            }}
            className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Entendido, dictar
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500">
            Mejor lo escribo
          </button>
        </>
      )}

      {phase === "error" && (
        <>
          <span className="grid size-16 place-items-center rounded-full bg-rose-50 text-rose-600">
            <MicOff className="size-8" />
          </span>
          <p className="max-w-xs text-sm font-medium text-slate-600">{error}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600">
              Escribir
            </button>
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={() => void start()}
                className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Intentar de nuevo
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
