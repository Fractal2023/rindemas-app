"use client";

/**
 * PIN lock helpers.
 *
 * This is an access gate for people sharing the same phone, not encryption:
 * the finance data itself stays in LocalStorage as plain JSON.
 */

const UNLOCK_KEY = "rindemas_unlocked";

export const PIN_LENGTH = 4;

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPin(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

/** The lock stays open until the tab/app is closed. */
export function isSessionUnlocked() {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionUnlocked(unlocked: boolean) {
  try {
    if (unlocked) window.sessionStorage.setItem(UNLOCK_KEY, "1");
    else window.sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    // sessionStorage blocked: the user will simply be asked for the PIN again.
  }
}
