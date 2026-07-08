import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const iconTileVariants = cva("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", {
  variants: {
    color: {
      brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
      accent: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300",
      success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500",
      warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500",
      info: "bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-500",
    },
  },
  defaultVariants: { color: "brand" },
});

export interface IconTileProps extends VariantProps<typeof iconTileVariants> {
  icon: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  className?: string;
}

/**
 * Colored-icon quick-link/stat tile - the "Dashboard / My Account / Schedules" card
 * pattern from reference dashboards. Renders as a link when `href` is given (portal
 * quick-links), otherwise as a static stat display (homepage "why choose us" row).
 */
export function IconTile({ icon: Icon, title, description, color, href, className }: IconTileProps) {
  const content = (
    <>
      <div className={cn(iconTileVariants({ color }))}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900 dark:text-neutral-50">{title}</p>
        {description && (
          <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
    </>
  );

  const baseClasses = "flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseClasses,
          "transition-all duration-150 ease-out-expo hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn(baseClasses, className)}>{content}</div>;
}
