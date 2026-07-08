"use client";

import { CalendarCheck, GraduationCap, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemePresetSwitcher, ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/student/search", label: "Find a tutor", icon: Search },
  { href: "/student/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/student/profile", label: "Profile", icon: User },
];

/**
 * Shell for student-facing screens. Per Phase 1 IA, the full set is Dashboard/
 * Search/My Bookings/Booking detail/My Reviews/Profile/Support - Search (Phase 6)
 * and Bookings (Phase 8) exist so far; Reviews/Support land with Phases 9-10.
 */
export function StudentShell({ children }: { children: React.ReactNode }) {
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
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                pathname?.startsWith(item.href) && "bg-brand-500 text-white hover:bg-brand-600",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
          <ThemePresetSwitcher />
          <ThemeToggle />
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
