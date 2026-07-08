/**
 * Canonical design tokens - see docs/phase-design-system/README.md for the original
 * rationale and docs/phase-design-system-v2/README.md for the runtime-theming
 * architecture built on top of it.
 *
 * `ThemeTokens` is the single shape every platform (website Tailwind config, admin MUI
 * theme, Flutter AppTheme) resolves against at runtime - not just at build time. Swapping
 * `THEME_PRESETS[name]` changes the whole app's look without editing Tailwind config, MUI
 * theme.ts, or Dart source on any platform; each platform's ThemeConfigProvider just picks
 * a different preset (or a custom one) and re-renders.
 */

export interface ColorScale {
  50: string;
  100: string;
  300: string;
  500: string;
  600: string;
  700: string;
}

export interface SemanticColor {
  50: string;
  500: string;
  700: string;
}

export interface ThemeTokens {
  name: string;
  brand: ColorScale;
  accent: ColorScale;
  semantic: {
    success: SemanticColor;
    warning: SemanticColor;
    danger: SemanticColor;
    info: SemanticColor;
  };
  radius: { sm: string; md: string; lg: string };
}

/** The current default: deep indigo brand with a coral-rose accent, used for CTAs,
 *  highlights, and anything that needs to visually pop against the indigo primary. */
const indigoCoral: ThemeTokens = {
  name: "indigo-coral",
  brand: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    300: "#A5B4FC",
    500: "#4F46E5",
    600: "#4338CA",
    700: "#3730A3",
  },
  accent: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    300: "#FDA4AF",
    500: "#FB7185",
    600: "#F43F5E",
    700: "#E11D48",
  },
  semantic: {
    success: { 50: "#F0FDF4", 500: "#16A34A", 700: "#15803D" },
    warning: { 50: "#FFFBEB", 500: "#D97706", 700: "#B45309" },
    danger: { 50: "#FEF2F2", 500: "#DC2626", 700: "#B91C1C" },
    info: { 50: "#ECFEFF", 500: "#0891B2", 700: "#0E7490" },
  },
  radius: { sm: "8px", md: "12px", lg: "20px" },
};

/** The palette this product used before the Indigo & Coral redesign - kept as a
 *  selectable preset so nothing breaks for anything still referencing it by name. */
const homeTuitionsBlue: ThemeTokens = {
  name: "hometuitions-blue",
  brand: {
    50: "#EEF6FF",
    100: "#D9EAFF",
    300: "#7FADF5",
    500: "#2F6FED",
    600: "#2557C7",
    700: "#1D439C",
  },
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    300: "#FDBA74",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
  },
  semantic: {
    success: { 50: "#F0FDF4", 500: "#16A34A", 700: "#15803D" },
    warning: { 50: "#FFFBEB", 500: "#D97706", 700: "#B45309" },
    danger: { 50: "#FEF2F2", 500: "#DC2626", 700: "#B91C1C" },
    info: { 50: "#ECFEFF", 500: "#0891B2", 700: "#0E7490" },
  },
  radius: { sm: "6px", md: "10px", lg: "16px" },
};

/** A second real preset (not a placeholder) - proves the token shape actually drives
 *  every platform's rendering rather than being decorative. Same semantic colors (status
 *  meaning shouldn't change with rebrands) but a distinct, warmer brand hue and slightly
 *  more rounded corners. */
const emeraldCampus: ThemeTokens = {
  name: "emerald-campus",
  brand: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    300: "#6EE7B7",
    500: "#059669",
    600: "#047857",
    700: "#065F46",
  },
  accent: {
    50: "#FDF4FF",
    100: "#FAE8FF",
    300: "#E9A8FD",
    500: "#C026D3",
    600: "#A21CAF",
    700: "#86198F",
  },
  semantic: homeTuitionsBlue.semantic,
  radius: { sm: "8px", md: "12px", lg: "20px" },
};

const vidyaRoyal: ThemeTokens = {
  name: "vidya-royal",
  brand: {
    50: "#F0F6FF",
    100: "#E0ECFF",
    300: "#93C5FD",
    500: "#2563EB",
    600: "#1D4ED8",
    700: "#1E40AF",
  },
  accent: {
    50: "#FFFDF0",
    100: "#FEF7C3",
    300: "#FDE047",
    500: "#EAB308",
    600: "#CA8A04",
    700: "#A16207",
  },
  semantic: homeTuitionsBlue.semantic,
  radius: { sm: "8px", md: "12px", lg: "20px" },
};

export const THEME_PRESETS: Record<string, ThemeTokens> = {
  "indigo-coral": indigoCoral,
  "hometuitions-blue": homeTuitionsBlue,
  "emerald-campus": emeraldCampus,
  "vidya-royal": vidyaRoyal,
};

export const DEFAULT_THEME_NAME = "vidya-royal";

export function resolveThemeTokens(name: string | null | undefined): ThemeTokens {
  return THEME_PRESETS[name ?? DEFAULT_THEME_NAME] ?? indigoCoral;
}

/** Flattens a ThemeTokens into a flat CSS custom-property map (`--color-brand-500`, etc.)
 *  - used by the website's ThemeConfigProvider to apply a preset via
 *  `document.documentElement.style.setProperty`, and reusable anywhere else a flat
 *  key/value view is more convenient than the nested ThemeTokens shape. */
export function themeTokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [shade, value] of Object.entries(tokens.brand)) {
    vars[`--color-brand-${shade}`] = hexToRgbTriplet(value);
  }
  for (const [shade, value] of Object.entries(tokens.accent)) {
    vars[`--color-accent-${shade}`] = hexToRgbTriplet(value);
  }
  for (const [name, scale] of Object.entries(tokens.semantic)) {
    for (const [shade, value] of Object.entries(scale)) {
      vars[`--color-${name}-${shade}`] = hexToRgbTriplet(value);
    }
  }
  vars["--radius-sm"] = tokens.radius.sm;
  vars["--radius-md"] = tokens.radius.md;
  vars["--radius-lg"] = tokens.radius.lg;
  return vars;
}

/** "#2F6FED" -> "47 111 237" - the space-separated triplet format Tailwind's
 *  `rgb(var(--x) / <alpha-value>)` pattern expects, so opacity utilities (`bg-brand-500/10`)
 *  keep working on top of a runtime CSS variable instead of a static hex value. */
function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// --- Legacy flat exports, kept so existing call sites (Badge, tailwind.config.ts
// fallback values, etc.) don't need to change - all derived from the default preset. ---
export const colors = {
  brand: indigoCoral.brand,
  accent: indigoCoral.accent,
  neutral: {
    light: { 0: "#FFFFFF", 50: "#F8FAFC", 200: "#E2E8F0", 500: "#64748B", 900: "#0F172A" },
    dark: { 0: "#0B0F17", 50: "#111827", 200: "#293241", 500: "#94A3B8", 900: "#F1F5F9" },
  },
  semantic: indigoCoral.semantic,
} as const;

export const radius = indigoCoral.radius;

export const typeScale = {
  display: { size: 32, lineHeight: 40 },
  headline: { size: 24, lineHeight: 32 },
  title: { size: 18, lineHeight: 26 },
  body: { size: 16, lineHeight: 24 },
  label: { size: 14, lineHeight: 20 },
} as const;

export type BookingStatusColor = "success" | "warning" | "danger" | "info" | "neutral";

/** Maps domain status enums to a semantic color, so every platform's status
 *  badge agrees on what each state means visually. */
export const bookingStatusColor: Record<string, BookingStatusColor> = {
  PENDING_TUTOR_ACTION: "warning",
  PENDING_PAYMENT: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  DISPUTED: "danger",
  REJECTED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

export const verificationStatusColor: Record<string, BookingStatusColor> = {
  NOT_SUBMITTED: "neutral",
  SUBMITTED: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

/** For a single TutorDocument's status - distinct from verificationStatusColor above,
 *  which is for the tutor profile's overall verification state. Document status uses
 *  PENDING/APPROVED/REJECTED; profile status uses NOT_SUBMITTED/SUBMITTED/VERIFIED/REJECTED -
 *  they are not the same enum even though both flow into "is this tutor verified?". */
export const documentStatusColor: Record<string, BookingStatusColor> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};
