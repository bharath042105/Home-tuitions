"use client";

import { resolveThemeTokens } from "@hometuitions/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo, useState } from "react";
import { ColorModeProvider, useColorMode } from "@/lib/theme/color-mode-context";
import { ThemePresetProvider, useThemePreset } from "@/lib/theme/theme-preset-context";
import { getTheme } from "@/lib/theme/theme";

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { mode } = useColorMode();
  const { presetName } = useThemePreset();
  const theme = useMemo(() => getTheme(mode, resolveThemeTokens(presetName)), [mode, presetName]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ColorModeProvider>
        <ThemePresetProvider>
          <MuiThemeBridge>{children}</MuiThemeBridge>
        </ThemePresetProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}
