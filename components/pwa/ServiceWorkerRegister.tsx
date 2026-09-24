"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js (offline support). Production only: in `next dev` a service
 * worker would cache hot-reloaded chunks and get in the way.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Unsupported context (e.g. private mode): the app still works online.
    });
  }, []);
  return null;
}
