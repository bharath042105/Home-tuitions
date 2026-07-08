"use client";

import {
  DEFAULT_THEME_NAME,
  resolveThemeTokens,
  themeTokensToCssVars,
  THEME_PRESETS,
} from "@hometuitions/shared";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hometuitions_theme_preset";

interface ThemeConfigContextValue {
  presetName: string;
  availablePresets: string[];
  setPreset: (name: string) => void;
}

const ThemeConfigContext = createContext<ThemeConfigContextValue | null>(null);

/**
 * Applies the active ThemeTokens preset as CSS custom properties on <html> - every
 * existing `bg-brand-500`/`text-danger-700`/etc. Tailwind class re-themes instantly
 * because tailwind.config.ts resolves those colors against the same variables (see that
 * file). This is what makes theming "dynamic" rather than a Tailwind-config edit: no
 * component, page, or build step needs to change to support a new brand palette.
 *
 * Known FOUC tradeoff: unlike next-themes' dark/light toggle (which ships a blocking
 * inline script), a non-default preset chosen on a previous visit applies only after
 * this provider's effect runs on mount - a brief flash of the default palette is
 * possible. Accepted for now since preset-switching is expected to be rare (a settings
 * page action, not a per-visit choice like dark mode); revisit with an inline script
 * duplicating THEME_PRESETS if that assumption stops holding.
 */
export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [presetName, setPresetName] = useState(DEFAULT_THEME_NAME);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_PRESETS[stored]) {
      setPresetName(stored);
    }
  }, []);

  useEffect(() => {
    const tokens = resolveThemeTokens(presetName);
    const cssVars = themeTokensToCssVars(tokens);
    for (const [key, value] of Object.entries(cssVars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [presetName]);

  const value = useMemo<ThemeConfigContextValue>(
    () => ({
      presetName,
      availablePresets: Object.keys(THEME_PRESETS),
      setPreset: (name: string) => {
        setPresetName(name);
        window.localStorage.setItem(STORAGE_KEY, name);
      },
    }),
    [presetName],
  );

  return <ThemeConfigContext.Provider value={value}>{children}</ThemeConfigContext.Provider>;
}

export function useThemeConfig() {
  const ctx = useContext(ThemeConfigContext);
  if (!ctx) throw new Error("useThemeConfig must be used within ThemeConfigProvider");
  return ctx;
}
