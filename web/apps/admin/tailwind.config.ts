import type { Config } from "tailwindcss";

// Tailwind handles layout/utility spacing; MUI handles data-dense components
// (tables, dialogs) - see docs/phase3/README.md for the split rationale.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: { preflight: false }, // avoid clobbering MUI's own baseline styles
  theme: { extend: {} },
  plugins: [],
};

export default config;
