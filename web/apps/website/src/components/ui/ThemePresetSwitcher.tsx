"use client";

import { Palette } from "lucide-react";
import { useThemeConfig } from "@/lib/theme/theme-config-provider";

/**
 * Proves the runtime-theming architecture is real, not just plumbing - picking a
 * different preset here re-themes every existing page instantly (no reload, no
 * per-component change). See theme-config-provider.tsx for how.
 */
export function ThemePresetSwitcher() {
  const { presetName, availablePresets, setPreset } = useThemeConfig();

  return (
    <label className="flex h-9 items-center gap-1.5 rounded-md px-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <Palette size={16} />
      <select
        value={presetName}
        onChange={(e) => setPreset(e.target.value)}
        className="bg-transparent text-sm text-neutral-700 focus:outline-none dark:text-neutral-300"
        aria-label="Theme preset"
      >
        {availablePresets.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
