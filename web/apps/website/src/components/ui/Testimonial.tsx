import { Quote } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  className?: string;
}

export function Testimonial({ quote, name, role, className }: TestimonialProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <Quote size={22} className="text-accent-500" strokeWidth={1.5} />
      <p className="text-neutral-700 dark:text-neutral-300">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-50">{name}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{role}</p>
      </div>
    </div>
  );
}
