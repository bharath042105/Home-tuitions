"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Moon, Sun, Laptop } from "lucide-react";
import { Button, Logo, ThemePresetSwitcher, ThemeToggle } from "@/components/ui";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/request-tutor", label: "For Parents" },
  { href: "/tutor-registration", label: "For Tutors" },
  { href: "/fee-structure", label: "Fee Structure" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-250/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/80 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="transition-opacity hover:opacity-90 shrink-0">
          <Logo size="md" />
        </Link>

        {/* Center: Desktop Navigation Links (Visible on md and up) */}
        <nav className="hidden items-center gap-6 text-[13.5px] font-bold text-neutral-600 dark:text-neutral-300 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1.5 transition-colors hover:text-brand-500 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-500 after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Phone CTA & Theme Toggle (Desktop View) */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          <ThemePresetSwitcher />
          <ThemeToggle />
          <a
            href="tel:+918074470640"
            className="flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-accent-600 active:scale-95 transition-all shadow-md shadow-accent-500/10"
          >
            <Phone size={14} className="animate-pulse" />
            <span>Call Us: +91 80744 70640</span>
          </a>
        </div>

        {/* Mobile Controller Button (Visible on screens smaller than md) */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-350 dark:hover:bg-neutral-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Expandable menu on mobile resize) */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg animate-fade-in-up">
          <nav className="flex flex-col gap-1.5 px-4 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-brand-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Call Block */}
            <div className="border-t border-neutral-100 dark:border-neutral-850 mt-3 pt-4 px-3 flex flex-col gap-3">
              <a
                href="tel:+918074470640"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent-500 py-3 text-sm font-extrabold text-white hover:bg-accent-600 transition-all shadow-md"
              >
                <Phone size={16} />
                <span>Call Us: +91 80744 70640</span>
              </a>
              <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                <span>Theme Preset:</span>
                <ThemePresetSwitcher />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
