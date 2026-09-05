"use client";

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Ticket,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useColorMode } from "@/lib/theme/color-mode-context";
import { useThemePreset } from "@/lib/theme/theme-preset-context";
import { isLoggedIn, setTokens } from "@/lib/api/client";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Dashboard",           icon: LayoutDashboard },
  { href: "/verifications", label: "Tutor Verifications", icon: ShieldCheck },
  { href: "/users",         label: "Users",               icon: Users },
  { href: "/bookings",      label: "Bookings",            icon: CalendarCheck },
  { href: "/leads",         label: "Leads",               icon: Mail },
  { href: "/tickets",       label: "Support Tickets",     icon: Ticket },
];

function VidyaLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 select-none overflow-hidden transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-2xl border border-brand-500/30 dark:border-brand-400/40 bg-white dark:bg-neutral-900 shadow-sm">
        <Image
          src="/logo.png"
          alt="Vidya Logo"
          fill
          sizes="36px"
          className="object-contain p-0.5"
          priority
        />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">Vidya</span>
          <span className="text-[9px] uppercase tracking-widest font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Home Tuitions</span>
          <span className="text-[8px] uppercase tracking-widest font-medium text-amber-500 mt-0.5">Admin Panel</span>
        </div>
      )}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggle } = useColorMode();
  const { presetName, availablePresets, setPreset } = useThemePreset();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/login" && !isLoggedIn()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const sidebarWidth = collapsed ? "w-16" : "w-56";

  const NavContent = () => (
    <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
              ${active
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
              } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarWidth}`}
      >
        {/* Brand + Collapse Toggle */}
        <div className={`flex items-center border-b border-neutral-200 dark:border-neutral-800 h-16 px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
          <VidyaLogo collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors ${collapsed ? "hidden" : ""}`}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-2 p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <NavContent />

        {/* Bottom Controls */}
        <div className={`border-t border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          {/* Theme Preset */}
          {!collapsed && (
            <select
              value={presetName}
              onChange={(e) => setPreset(e.target.value)}
              aria-label="Theme preset"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availablePresets.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
          <div className={`flex items-center ${collapsed ? "flex-col" : "justify-between"} gap-1`}>
            <button
              onClick={toggle}
              title="Toggle dark mode"
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition-colors"
            >
              {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => { setTokens(null); router.replace("/login"); }}
              title="Log out"
              className="p-2 rounded-lg text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <VidyaLogo collapsed={false} />
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col pt-14 shadow-xl">
            <NavContent />
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex gap-2">
              <select
                value={presetName}
                onChange={(e) => setPreset(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                {availablePresets.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button
                onClick={() => { setTokens(null); router.replace("/login"); setMobileOpen(false); }}
                className="p-2 rounded-lg text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────── */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-56"} pt-14 md:pt-0`}>
        {/* Top Header Bar (Desktop) */}
        <header className="hidden md:flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <BarChart3 size={15} className="text-blue-500" />
            <span className="font-medium capitalize">{pathname?.split("/")[1] || "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={presetName}
              onChange={(e) => setPreset(e.target.value)}
              aria-label="Theme preset"
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availablePresets.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition-colors"
            >
              {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => { setTokens(null); router.replace("/login"); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
