import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function formatMXN(value: number, opts: { sign?: boolean } = {}) {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  if (value < 0) return `-${formatted}`;
  return opts.sign && value > 0 ? `+${formatted}` : formatted;
}

export function formatPct(value: number, opts: { sign?: boolean } = { sign: true }) {
  const abs = Math.abs(value).toFixed(1).replace(/\.0$/, "");
  if (!opts.sign || value === 0) return `${value < 0 ? "-" : ""}${abs}%`;
  return `${value > 0 ? "+" : "-"}${abs}%`;
}

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* ---------- Dates ---------- */

const DAY = 24 * 60 * 60 * 1000;

/** Monday 00:00 local time of the week containing `date`. */
export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d;
}

/** [start, end) of the week `offset` weeks from the current one (0 = this week, -1 = last week). */
export function weekRange(offset: number, now = new Date()): [Date, Date] {
  const start = startOfWeek(now);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start, end];
}

export function isInRange(iso: string, [start, end]: [Date, Date]) {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function relativeDay(iso: string, now = new Date()) {
  const diff = Math.round((startOfDay(now).getTime() - startOfDay(new Date(iso)).getTime()) / DAY);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) {
    const name = new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(new Date(iso));
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return shortDate(iso);
}

export function shortDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function timeOfDay(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function longToday(now = new Date()) {
  const s = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(now);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    // Skip words that don't start with a letter or digit, e.g. "(prueba" or "+".
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
