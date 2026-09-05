import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AppProviders } from "@/lib/api/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vidya Home Tuitions - Admin Portal",
  description: "Operations dashboard for Vidya Home Tuitions marketplace",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
