"use client";

import { useSyncExternalStore } from "react";
import { createLocalStorageAdapter } from "./storage";

/**
 * A small persisted list (one LocalStorage key per list), shared by the extra
 * incomes, extra expenses and loans modules. 100% local and offline.
 */

interface ListState<T> {
  version: 1;
  items: T[];
}

export interface LocalList<T extends { id: string }> {
  useItems(): T[];
  all(): T[];
  add(item: T): void;
  update(id: string, patch: Partial<T>): void;
  remove(id: string): void;
  replaceAll(items: T[]): void;
  /** Deletes the key and leaves an empty list. */
  wipe(): void;
}

export function createLocalList<T extends { id: string }>(key: string): LocalList<T> {
  const isState = (v: unknown): v is ListState<T> => {
    const s = v as ListState<T>;
    return !!s && s.version === 1 && Array.isArray(s.items);
  };
  const storage = createLocalStorageAdapter<ListState<T>>(key, isState);
  const EMPTY: T[] = [];
  let state: ListState<T> | null = null;
  const listeners = new Set<() => void>();

  const ensure = (): ListState<T> => {
    if (!state) state = storage.load() ?? { version: 1, items: [] };
    return state;
  };
  const set = (items: T[]) => {
    state = { version: 1, items };
    storage.save(state);
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const unwatch = storage.onExternalChange(() => {
      state = storage.load() ?? state;
      listeners.forEach((l) => l());
    });
    return () => {
      listeners.delete(listener);
      unwatch();
    };
  };

  return {
    useItems: () =>
      useSyncExternalStore(
        subscribe,
        () => ensure().items,
        () => EMPTY,
      ),
    all: () => ensure().items,
    add: (item) => set([item, ...ensure().items]),
    update: (id, patch) => set(ensure().items.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id) => set(ensure().items.filter((x) => x.id !== id)),
    replaceAll: (items) => set(items),
    wipe: () => {
      storage.clear();
      set([]);
    },
  };
}
