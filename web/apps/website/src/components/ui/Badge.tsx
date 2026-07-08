import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { BookingStatusColor } from "@hometuitions/shared";

const badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium", {
  variants: {
    color: {
      success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500",
      warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500",
      danger: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500",
      info: "bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-500",
      neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    },
  },
  defaultVariants: { color: "neutral" },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  color?: BookingStatusColor;
}

export function Badge({ className, color, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ color }), className)} {...props} />;
}
