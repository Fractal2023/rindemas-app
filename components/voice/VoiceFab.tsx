"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { isSpeechSupported } from "@/lib/voice/speech";

/**
 * Floating mic above the bottom nav: opens quick add straight into dictation.
 * Hidden when the browser has no speech recognition (the form's mic still
 * explains why), so there is never a dead button on screen.
 * Only rendered on the client (AppShell mounts it once data has loaded).
 */
export function VoiceFab({ onClick }: { onClick: () => void }) {
  if (!isSpeechSupported()) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-full max-w-md justify-end px-5">
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pointer-events-auto grid size-13 place-items-center rounded-full bg-white text-emerald-600 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.3)] ring-1 ring-slate-200 hover:bg-emerald-50"
        aria-label="Registrar compra por voz"
      >
        <Mic className="size-6" />
      </motion.button>
    </div>
  );
}
