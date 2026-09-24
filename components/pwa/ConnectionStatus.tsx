"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, Wifi } from "lucide-react";
import { useConnection } from "@/lib/connection";

/** Small pill pinned to the top of the app: offline notice, then a brief "back online" confirmation. */
export function ConnectionStatus() {
  const { online, justReconnected } = useConnection();
  const show = !online || justReconnected;

  return (
    <div
      className="pointer-events-none sticky top-0 z-30 flex h-0 justify-center pt-[max(0.5rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {show && (
          <motion.span
            key={online ? "online" : "offline"}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={
              online
                ? "inline-flex h-fit items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-600/30"
                : "inline-flex h-fit items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow-lg ring-1 ring-black/5"
            }
          >
            {online ? (
              <>
                <Wifi className="size-3.5" /> Conexión recuperada · todo sigue guardado
              </>
            ) : (
              <>
                <CloudOff className="size-3.5" /> Modo Offline (Guardando en dispositivo)
              </>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
