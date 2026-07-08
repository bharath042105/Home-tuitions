import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Styled off the standard aria-invalid attribute (via Tailwind's built-in
          // aria-invalid: variant, a pure CSS attribute selector) rather than a custom
          // `invalid` boolean prop - `aria-invalid` is valid on every HTML element, so
          // FormField can inject it onto any child (a styled Input or a raw <select>)
          // without leaking a non-standard attribute into the DOM. See FormField.tsx.
          "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 aria-invalid:border-danger-500 aria-invalid:focus:border-danger-500 aria-invalid:focus:ring-danger-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
