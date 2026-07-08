import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepperProps {
  steps: string[];
  activeIndex: number;
  className?: string;
}

/** Horizontal progress stepper for multi-step flows (tutor onboarding, verification) -
 *  purely a client-side grouping over a single form; the step index doesn't change what
 *  gets submitted, only which fields are visible. */
export function Stepper({ steps, activeIndex, className }: StepperProps) {
  return (
    <ol className={cn("flex w-full items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const isLast = index === steps.length - 1;
        return (
          <li key={step} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150",
                  isComplete && "bg-brand-500 text-white",
                  isActive && "border-2 border-brand-500 text-brand-600 dark:text-brand-300",
                  !isComplete && !isActive &&
                    "border border-neutral-300 text-neutral-400 dark:border-neutral-700 dark:text-neutral-500",
                )}
              >
                {isComplete ? <Check size={16} /> : index + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  (isComplete || isActive) ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-400 dark:text-neutral-500",
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full transition-colors duration-150",
                  isComplete ? "bg-brand-500" : "bg-neutral-200 dark:bg-neutral-800",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
