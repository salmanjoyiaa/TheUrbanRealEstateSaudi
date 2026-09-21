"use client";

import { cn } from "@/lib/utils";

type SaudiFlagProps = {
  className?: string;
  /** Adds a soft glossy sweep over the field. */
  sheen?: boolean;
  decorative?: boolean;
  /** Fill the container (crop edges) instead of preserving the 3:2 box. */
  cover?: boolean;
};

/**
 * Flag of the Kingdom of Saudi Arabia — green field, Shahada in white, sword beneath (blade toward the hoist).
 * Always render upright and unobscured.
 */
export function SaudiFlag({
  className,
  sheen = false,
  decorative = false,
  cover = false,
}: SaudiFlagProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio={cover ? "xMidYMid slice" : "xMidYMid meet"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Flag of Saudi Arabia"}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id="saudi-flag-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a7d40" />
          <stop offset="100%" stopColor="#005a2b" />
        </linearGradient>
        <linearGradient id="saudi-flag-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="300" height="200" fill="url(#saudi-flag-field)" />

      <text
        x="150"
        y="94"
        textAnchor="middle"
        direction="rtl"
        textLength="228"
        lengthAdjust="spacingAndGlyphs"
        fill="#ffffff"
        fontSize="27"
        fontWeight="700"
        fontFamily="var(--font-arabic), 'Noto Sans Arabic', 'Noto Naskh Arabic', 'Traditional Arabic', 'Amiri', serif"
      >
        لا إله إلا الله محمد رسول الله
      </text>

      {/* Sword — hilt on the right, blade pointing left toward the hoist */}
      <g fill="#ffffff">
        <path d="M54 136.5 Q 130 126.5 206 130 L206 141.5 Q 130 143.5 58 140 Z" />
        <rect x="203" y="127" width="10" height="17.5" rx="3" />
        <rect x="212" y="131.5" width="27" height="8.5" rx="4.25" />
        <circle cx="244" cy="135.75" r="5.5" />
      </g>

      {sheen ? <rect width="300" height="200" fill="url(#saudi-flag-sheen)" /> : null}
    </svg>
  );
}

/** Tiny flag chip for badges — plain green/white mark at sizes where text would be illegible. */
export function SaudiFlagChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/30",
        className
      )}
      aria-hidden
    >
      <span className="flex h-full w-full flex-col items-center justify-center gap-[1.5px] bg-[#006c35]">
        <span className="h-[2px] w-2.5 rounded-full bg-white/95" />
        <span className="h-px w-2 rounded-full bg-white/80" />
      </span>
    </span>
  );
}
