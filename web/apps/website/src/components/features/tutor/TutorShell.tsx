"use client";

import { CalendarCheck, Clock3, GraduationCap, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemePresetSwitcher, ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/tutor/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/tutor/profile", label: "Profile", icon: User },
  { href: "/tutor/verification", label: "Verification", icon: ShieldCheck },
  { href: "/tutor/availability", label: "Availability", icon: Clock3 },
];

/**
 * Shell for tutor-facing screens (Phase 1 IA: Dashboard/Profile/Availability/
 * Booking Requests/My Sessions/Earnings/Reviews). Profile/Verification/Availability
 * (Phase 5) and Bookings (Phase 8) exist so far - Earnings/Reviews land with Phase 9/14.
 */
export function TutorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          <GraduationCap className="text-brand-500" size={22} />
          Home Tuitions
        </Link>
        <div className="flex items-center gap-1">
          <ThemePresetSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
        <nav className="w-48 shrink-0">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                    pathname?.startsWith(item.href) &&
                      "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
