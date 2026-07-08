import { cloneElement, isValidElement, useId } from "react";

export interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

/**
 * Wraps a single input with a label + error message, wiring up aria attributes
 * so screen readers announce the error (SRS non-functional requirement: accessible).
 * Every auth/form screen should use this instead of hand-rolling label/error markup.
 *
 * Injects `aria-invalid` (a standard HTML attribute valid on every element, including
 * a raw native <select>) rather than a custom `invalid` prop - an earlier version used
 * `invalid`, which leaked onto the DOM as a bogus attribute whenever FormField wrapped
 * a plain native element instead of the styled Input component (React warned: "Received
 * `false` for a non-boolean attribute `invalid`" on the register page's role <select>).
 */
export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  const field = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {field}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
