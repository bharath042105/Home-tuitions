import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: {
      svg: "h-8 w-8",
      text: "text-base",
    },
    md: {
      svg: "h-10 w-10",
      text: "text-lg",
    },
    lg: {
      svg: "h-14 w-14",
      text: "text-2xl",
    },
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className || ""}`}>
      {/* Dynamic SVG Icon */}
      <div className={`relative ${sizeClasses[size].svg} transition-transform duration-300 hover:scale-105 active:scale-95`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="logo-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="logo-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Outer Shield Outline */}
          <path
            d="M50 5 C75 5, 90 12, 90 40 C90 70, 70 90, 50 95 C30 90, 10 70, 10 40 C10 12, 25 5, 50 5 Z"
            fill="url(#logo-brand-grad)"
            className="transition-all duration-300"
          />

          {/* Inner Shield / Book Base */}
          <path
            d="M50 12 C68 12, 80 18, 80 40 C80 63, 65 80, 50 85 C35 80, 20 63, 20 40 C20 18, 32 12, 50 12 Z"
            fill="#FFFFFF"
            className="dark:fill-neutral-900"
          />

          {/* Open Book Pages */}
          <path
            d="M50 62 C50 62, 38 52, 28 55 L28 32 C38 29, 50 38, 50 38 C50 38, 62 29, 72 32 L72 55 C62 52, 50 62, 50 62 Z"
            fill="url(#logo-brand-grad)"
            opacity="0.15"
          />
          <path
            d="M50 60 C46 56, 36 53, 30 55 V34 C36 32, 46 35, 50 38 M50 60 C54 56, 64 53, 70 55 V34 C64 32, 54 35, 50 38"
            stroke="url(#logo-brand-grad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rising Sun / Flame (Diya - Knowledge Light) */}
          <path
            d="M50 35 C50 35, 57 27, 57 21 C57 15, 50 12, 50 12 C50 12, 43 15, 43 21 C43 27, 50 35, 50 35 Z"
            fill="url(#logo-accent-grad)"
          />
          <path
            d="M50 31 C50 31, 54 26, 54 22 C54 18, 50 16, 50 16 C50 16, 46 18, 46 22 C46 26, 50 31, 50 31 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />

          {/* Graduation Cap Lines / Star Accent */}
          <path
            d="M50 68 L50 78"
            stroke="url(#logo-accent-grad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="50" cy="80" r="4.5" fill="url(#logo-accent-grad)" />
        </svg>
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
