import { describe, expect, it } from "vitest";
import { DEFAULT_THEME_NAME, resolveThemeTokens, themeTokensToCssVars, THEME_PRESETS } from "../tokens";

describe("resolveThemeTokens", () => {
  it("returns the default preset for null/undefined", () => {
    expect(resolveThemeTokens(undefined).name).toBe(DEFAULT_THEME_NAME);
    expect(resolveThemeTokens(null).name).toBe(DEFAULT_THEME_NAME);
  });

  it("returns the default preset for an unknown name rather than throwing - a stale localStorage value from a removed preset must not break the app", () => {
    expect(resolveThemeTokens("a-preset-that-does-not-exist").name).toBe(DEFAULT_THEME_NAME);
  });

  it("resolves a known preset by name", () => {
    expect(resolveThemeTokens("emerald-campus").name).toBe("emerald-campus");
  });

  it("every registered preset shares the same semantic color meanings (status colors shouldn't change with a rebrand)", () => {
    const presetNames = Object.keys(THEME_PRESETS);
    const [first, ...rest] = presetNames.map((name) => THEME_PRESETS[name].semantic);
    for (const semantic of rest) {
      expect(semantic).toEqual(first);
    }
  });
});

describe("themeTokensToCssVars", () => {
  it("converts a hex brand color into a space-separated RGB triplet Tailwind's rgb(var(--x) / <alpha-value>) pattern expects", () => {
    const vars = themeTokensToCssVars(resolveThemeTokens("hometuitions-blue"));
    expect(vars["--color-brand-500"]).toBe("47 111 237"); // #2F6FED
  });

  it("includes all three radius tokens", () => {
    const vars = themeTokensToCssVars(resolveThemeTokens("hometuitions-blue"));
    expect(vars["--radius-sm"]).toBeDefined();
    expect(vars["--radius-md"]).toBeDefined();
    expect(vars["--radius-lg"]).toBeDefined();
  });
});
