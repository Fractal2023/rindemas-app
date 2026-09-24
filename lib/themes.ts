import type { PlanTier, ThemeId } from "./types";

/**
 * Visual themes for RindeMás.
 *
 * Components use plain Tailwind classes (`bg-emerald-600`, `text-slate-900`, …).
 * Tailwind v4 compiles those to CSS variables (`var(--color-emerald-600)`), so a
 * theme only has to redefine the variables below — no component needs to know
 * which theme is active.
 *
 * - `accent`   → replaces the `emerald` scale (buttons, highlights, savings)
 * - `accentEnd`→ replaces `teal-700` (end of the hero gradients)
 * - `neutral`  → replaces the `slate` scale (backgrounds, text, borders)
 * - `extra`    → any other Tailwind color variable (dark themes remap white, rose, …)
 */

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type ColorScale = Partial<Record<Shade, string>>;

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  tier: PlanTier;
  dark: boolean;
  /** Colors for the picker thumbnail. */
  preview: { bg: string; card: string; accent: string; accentEnd: string; text: string };
  accent: ColorScale;
  accentEnd: string;
  neutral?: ColorScale;
  extra?: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "esmeralda",
    name: "Esmeralda",
    description: "El clásico de RindeMás: fresco y claro",
    tier: "free",
    dark: false,
    preview: { bg: "#f8fafc", card: "#ffffff", accent: "#059669", accentEnd: "#0f766e", text: "#0f172a" },
    // Tailwind's default emerald + slate: nothing to override.
    accent: {},
    accentEnd: "#0f766e",
  },
  {
    id: "neon",
    name: "Oscuro Neón",
    description: "Fondo oscuro con acentos neón que brillan",
    tier: "pro",
    dark: true,
    preview: { bg: "#070b14", card: "#0e1422", accent: "#00f5a0", accentEnd: "#00c8ff", text: "#f3f6fb" },
    accent: {
      50: "#06281f",
      100: "#0a3a2c",
      400: "#5dffc0",
      500: "#2bffa3",
      600: "#00f5a0",
      700: "#5dffc0",
      900: "#c9ffe9",
    },
    accentEnd: "#00c8ff",
    neutral: {
      50: "#070b14",
      100: "#131b2b",
      200: "#1f2a3d",
      300: "#33415a",
      400: "#6b7791",
      500: "#8f9ab0",
      600: "#b3bccd",
      700: "#cfd6e3",
      800: "#e3e8f0",
      900: "#f3f6fb",
      950: "#ffffff",
    },
    extra: {
      white: "#0e1422",
      "rose-50": "#2d0b19",
      "rose-100": "#451027",
      "rose-500": "#ff4f8b",
      "rose-600": "#ff5c93",
      "rose-700": "#ff85ad",
      "amber-50": "#2a1f05",
      "amber-300": "#ffd54a",
      "amber-400": "#ffc53d",
      "amber-600": "#ffc53d",
      "amber-950": "#1a1200",
      "sky-50": "#06202e",
      "sky-100": "#0a2f44",
      "sky-300": "#7dd8ff",
      "sky-400": "#38c8ff",
      "sky-500": "#22b8f0",
      "sky-600": "#5cd0ff",
    },
  },
  {
    id: "terracota",
    name: "Terracota Cálido",
    description: "Tonos de barro y arena, cálido como la cocina",
    tier: "pro",
    dark: false,
    preview: { bg: "#faf7f2", card: "#ffffff", accent: "#c2562f", accentEnd: "#7c2d12", text: "#221c17" },
    accent: {
      50: "#fdf4ef",
      100: "#fbe3d6",
      400: "#e59572",
      500: "#d9774f",
      600: "#c2562f",
      700: "#9c4424",
      900: "#5c2a17",
    },
    accentEnd: "#7c2d12",
    neutral: {
      50: "#faf7f2",
      100: "#f3eee6",
      200: "#e7e0d5",
      300: "#d5cbbd",
      400: "#a89c8c",
      500: "#7c7064",
      600: "#5e544a",
      700: "#4a4139",
      800: "#342d27",
      900: "#221c17",
      950: "#140f0b",
    },
  },
  {
    id: "azul",
    name: "Azul Ejecutivo",
    description: "Sobrio y profesional, azul marino y acero",
    tier: "pro",
    dark: false,
    preview: { bg: "#f5f8fc", card: "#ffffff", accent: "#1d4ed8", accentEnd: "#0f1f4d", text: "#0f172a" },
    accent: {
      50: "#eff5ff",
      100: "#dbe7fe",
      400: "#6b9cf5",
      500: "#3b76e8",
      600: "#1d4ed8",
      700: "#1e3fae",
      900: "#172a6b",
    },
    accentEnd: "#0f1f4d",
    neutral: { 50: "#f5f8fc" },
  },
  {
    id: "morado-menta",
    name: "Morado Menta",
    description: "Violeta vibrante con un toque de menta fresca",
    tier: "pro",
    dark: false,
    preview: { bg: "#f8f7fc", card: "#ffffff", accent: "#7c3aed", accentEnd: "#0fb5a0", text: "#1e1b2e" },
    accent: {
      50: "#f5f0ff",
      100: "#ebe2ff",
      400: "#a98bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6425c9",
      900: "#3f1a80",
    },
    accentEnd: "#0fb5a0",
    neutral: { 50: "#f8f7fc" },
  },
];

export const DEFAULT_THEME: ThemeId = "esmeralda";

export function getTheme(id: ThemeId | undefined): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function isProTheme(id: ThemeId) {
  return getTheme(id).tier === "pro";
}

function themeVariables(t: ThemeDefinition): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [shade, value] of Object.entries(t.accent)) vars[`--color-emerald-${shade}`] = value;
  if (t.id !== DEFAULT_THEME) vars["--color-teal-700"] = t.accentEnd;
  for (const [shade, value] of Object.entries(t.neutral ?? {})) vars[`--color-slate-${shade}`] = value;
  for (const [name, value] of Object.entries(t.extra ?? {})) vars[`--color-${name}`] = value;
  return vars;
}

/** CSS for every non-default theme, keyed by `html[data-theme="…"]`. Rendered once in the root layout. */
export function themeStylesheet() {
  return THEMES.filter((t) => t.id !== DEFAULT_THEME)
    .map((t) => {
      const body = Object.entries(themeVariables(t))
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
      return `html[data-theme="${t.id}"]{${body};color-scheme:${t.dark ? "dark" : "light"}}`;
    })
    .join("\n");
}

/**
 * Inline script that applies the saved theme before first paint (avoids a flash
 * of the default theme). Mirrors `effectiveTheme()` in lib/plan.ts. Only runs inside
 * the app: the marketing landing always uses the brand theme.
 */
export function themeBootScript(storageKey: string, appPath = "/app") {
  const proIds = THEMES.filter((t) => t.tier === "pro").map((t) => t.id);
  return `(function(){try{if(location.pathname.indexOf(${JSON.stringify(appPath)})!==0)return;var d=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||"null");var s=d&&d.settings;if(!s||!s.theme)return;var p=s.plan||{};var pro=p.tier==="pro"&&(!p.trialEndsAt||new Date(p.trialEndsAt)>new Date());if(pro||${JSON.stringify(proIds)}.indexOf(s.theme)<0)document.documentElement.setAttribute("data-theme",s.theme)}catch(e){}})()`;
}
