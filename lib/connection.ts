"use client";

import { useSyncExternalStore } from "react";

/** Online/offline status plus a short-lived "just reconnected" flag. */
export interface ConnectionState {
  online: boolean;
  justReconnected: boolean;
}

const RECONNECTED_MS = 3500;

let state: ConnectionState = { online: true, justReconnected: false };
let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: ConnectionState) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  state = { online: navigator.onLine, justReconnected: false };
  window.addEventListener("offline", () => {
    clearTimeout(timer);
    set({ online: false, justReconnected: false });
  });
  window.addEventListener("online", () => {
    set({ online: true, justReconnected: true });
    clearTimeout(timer);
    timer = setTimeout(() => set({ online: true, justReconnected: false }), RECONNECTED_MS);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_STATE: ConnectionState = { online: true, justReconnected: false };

export function useConnection(): ConnectionState {
  return useSyncExternalStore(
    subscribe,
    () => {
      start();
      return state;
    },
    () => SERVER_STATE,
  );
}
