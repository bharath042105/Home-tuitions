import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui";

const HIGHLIGHTS = [
  "Verified, background-checked tutors",
  "Live online or in-person sessions",
  "Flexible scheduling around your day",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-white dark:bg-neutral-950">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            <GraduationCap className="text-brand-500" size={24} />
            Home Tuitions
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>

      {/* Brand panel - hidden below lg since there isn't room for it alongside the form. */}
      <div className="relative hidden w-[42%] max-w-xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 lg:flex lg:flex-col lg:justify-end lg:p-12">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10"
        />
        <div aria-hidden className="absolute bottom-24 left-0 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Learning that fits your life.
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-white/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
