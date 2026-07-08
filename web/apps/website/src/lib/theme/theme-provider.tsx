"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes so dark mode is flicker-free (it injects a blocking inline
 * script that sets the `dark` class before hydration, avoiding the classic
 * light-flash-then-dark FOUC). attribute="class" matches Tailwind's
 * darkMode: "class" strategy in tailwind.config.ts.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
