import type { Config } from "tailwindcss";

// Each color resolves against a CSS custom property (set at runtime by
// ThemeConfigProvider - see src/lib/theme/theme-config-provider.tsx) rather than a
// hardcoded hex value, so switching the active preset re-themes every existing
// `bg-brand-500`/`text-danger-700`/etc. class across the whole app with zero component
// changes. `rgb(var(--x) / <alpha-value>)` is the standard pattern for keeping Tailwind's
// opacity modifiers (`bg-brand-500/10`) working on top of a variable.
function cssVarColor(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

function colorScale(prefix: string, shades: number[]) {
  return Object.fromEntries(shades.map((shade) => [shade, cssVarColor(`--color-${prefix}-${shade}`)]));
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: colorScale("brand", [50, 100, 300, 500, 600, 700]),
        accent: colorScale("accent", [50, 100, 300, 500, 600, 700]),
        success: colorScale("success", [50, 500, 700]),
        warning: colorScale("warning", [50, 500, 700]),
        danger: colorScale("danger", [50, 500, 700]),
        info: colorScale("info", [50, 500, 700]),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
