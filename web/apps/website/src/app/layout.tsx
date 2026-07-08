import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/api/query-provider";
import { ThemeConfigProvider } from "@/lib/theme/theme-config-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import "./globals.css";

// Self-hosted at build time (no runtime request to Google, no CSP exception needed)
// - see docs/phase-design-system/README.md Typography section.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Home Tuitions - Find Verified Tutors Online & Offline",
  description: "Book verified tutors for online and in-person home tuition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <ThemeConfigProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
