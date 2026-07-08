import { createTheme, type PaletteMode } from "@mui/material";
import { resolveThemeTokens, typeScale, type ThemeTokens } from "@hometuitions/shared";

/**
 * Builds the MUI theme from a ThemeTokens object rather than hardcoded hex values -
 * the same tokens the website resolves into CSS variables (see
 * web/apps/website/src/lib/theme/theme-config-provider.tsx). Passing a different
 * `tokens` (via ThemeConfigContext) re-themes every MUI component using `theme.palette.*`
 * without touching this file or any page.
 */
export function getTheme(mode: PaletteMode, tokens: ThemeTokens = resolveThemeTokens(undefined)) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        light: tokens.brand[300],
        main: tokens.brand[500],
        dark: tokens.brand[700],
        contrastText: "#FFFFFF",
      },
      secondary: {
        light: tokens.accent[300],
        main: tokens.accent[500],
        dark: tokens.accent[700],
        contrastText: "#FFFFFF",
      },
      success: { main: tokens.semantic.success[500] },
      warning: { main: tokens.semantic.warning[500] },
      error: { main: tokens.semantic.danger[500] },
      info: { main: tokens.semantic.info[500] },
      background: {
        default: isDark ? "#0B0F17" : "#F8FAFC",
        paper: isDark ? "#111827" : "#FFFFFF",
      },
    },
    shape: { borderRadius: parseInt(tokens.radius.md, 10) },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      h1: { fontSize: typeScale.display.size, lineHeight: `${typeScale.display.lineHeight}px`, fontWeight: 700 },
      h2: { fontSize: typeScale.headline.size, lineHeight: `${typeScale.headline.lineHeight}px`, fontWeight: 700 },
      h3: { fontSize: typeScale.title.size, lineHeight: `${typeScale.title.lineHeight}px`, fontWeight: 600 },
      subtitle1: { fontSize: typeScale.body.size, lineHeight: `${typeScale.body.lineHeight}px`, fontWeight: 600 },
      body1: { fontSize: typeScale.body.size, lineHeight: `${typeScale.body.lineHeight}px` },
      body2: { fontSize: typeScale.label.size, lineHeight: `${typeScale.label.lineHeight}px` },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { textTransform: "none", fontWeight: 500 } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: parseInt(tokens.radius.md, 10) },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: parseInt(tokens.radius.lg, 10),
            boxShadow: isDark
              ? "0 1px 2px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : tokens.brand[50],
          },
        },
      },
    },
  });
}
