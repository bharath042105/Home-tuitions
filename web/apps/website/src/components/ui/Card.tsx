import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** For cards that act like a clickable row (search results, list items) - adds a
   *  hover lift + border tint instead of the plain `hover:border-brand-500` each list
   *  page previously hand-rolled independently (student search, tutor detail, etc). */
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        interactive &&
          "cursor-pointer transition-all duration-150 ease-out-expo hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
