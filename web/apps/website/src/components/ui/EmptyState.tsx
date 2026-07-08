import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared empty-state pattern (icon + message + optional action) - replaces the plain
 * "No X yet" text paragraphs that search results, bookings lists, and tickets each
 * independently hand-rolled during earlier phases. Not every empty message needs the
 * full treatment (a one-line "no results" inside a table cell stays plain text), but
 * anywhere an empty state is the primary content of a page, this is the pattern.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700",
        className,
      )}
    >
      <Icon size={28} className="mb-1 text-neutral-400" strokeWidth={1.5} />
      <p className="font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
