import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AppProviders } from "@/lib/api/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Tuitions Admin",
  description: "Operations dashboard for the Home Tuitions marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AdminShell>{children}</AdminShell>
        </AppProviders>
      </body>
    </html>
  );
}
