"use client";

import { useEffect } from "react";
import { effectiveTheme } from "@/lib/plan";
import { DEFAULT_THEME } from "@/lib/themes";
import type { Settings } from "@/lib/types";

/** Keeps `<html data-theme>` in sync with the saved theme and plan; restores the brand theme when leaving the app. */
export function ThemeController({ settings }: { settings: Settings }) {
  const theme = effectiveTheme(settings);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      document.documentElement.dataset.theme = DEFAULT_THEME;
    };
  }, [theme]);
  return null;
}
