/** LocalStorage key for all app data. Also read by the theme boot script in app/layout.tsx. */
export const STORAGE_KEY = "rindemas_data";

/**
 * Storage adapter: the rest of the app only talks to this interface, so
 * LocalStorage can later be swapped for IndexedDB or a remote API.
 */
export interface StorageAdapter<T> {
  load(): T | null;
  save(value: T): void;
  clear(): void;
  /** Subscribe to changes made from another tab. Returns an unsubscribe fn. */
  onExternalChange(callback: () => void): () => void;
}

export function createLocalStorageAdapter<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): StorageAdapter<T> {
  const available = () => typeof window !== "undefined" && !!window.localStorage;

  return {
    load() {
      if (!available()) return null;
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(value) {
      if (!available()) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Quota exceeded or storage blocked: keep working in memory.
      }
    },
    clear() {
      if (!available()) return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
    onExternalChange(callback) {
      if (typeof window === "undefined") return () => {};
      const handler = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}
