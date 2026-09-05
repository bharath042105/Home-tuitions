import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: {
      box: "h-8 w-8",
      text: "text-base",
    },
    md: {
      box: "h-10 w-10",
      text: "text-lg",
    },
    lg: {
      box: "h-14 w-14",
      text: "text-2xl",
    },
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className || ""}`}>
      {/* Brand Icon Image */}
      <div className={`relative ${sizeClasses[size].box} shrink-0 overflow-hidden rounded-2xl border border-brand-500/30 dark:border-brand-400/40 bg-white dark:bg-neutral-900 transition-all duration-300 hover:scale-105 hover:border-brand-500 active:scale-95 shadow-md shadow-brand-500/10`}>
        <Image
          src="/logo.png"
          alt="Vidya Home Tuitions Logo"
          fill
          sizes="64px"
          className="object-contain p-0.5"
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none ${sizeClasses[size].text}`}>
            Vidya
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-600 dark:text-brand-400 mt-0.5 leading-none">
            Home Tuitions
          </span>
        </div>
      )}
    </div>
  );
}
