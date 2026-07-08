"use client";

import { DEFAULT_THEME_NAME, THEME_PRESETS } from "@hometuitions/shared";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hometuitions_admin_theme_preset";

interface ThemePresetContextValue {
  presetName: string;
  availablePresets: string[];
  setPreset: (name: string) => void;
}

const ThemePresetContext = createContext<ThemePresetContextValue | null>(null);

/** Sibling to ColorModeContext (light/dark) but a distinct concern - which brand
 *  palette, not which brightness. Kept separate since a real settings page would let
 *  an admin change one without the other. */
export function ThemePresetProvider({ children }: { children: React.ReactNode }) {
  const [presetName, setPresetName] = useState(DEFAULT_THEME_NAME);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_PRESETS[stored]) {
      setPresetName(stored);
    }
  }, []);

  const value = useMemo<ThemePresetContextValue>(
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

  return <ThemePresetContext.Provider value={value}>{children}</ThemePresetContext.Provider>;
}

export function useThemePreset() {
  const ctx = useContext(ThemePresetContext);
  if (!ctx) throw new Error("useThemePreset must be used within ThemePresetProvider");
  return ctx;
}
