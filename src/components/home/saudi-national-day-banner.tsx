"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type SaudiNationalDayBannerProps = {
  discountPercent: number;
  className?: string;
};

export function SaudiNationalDayBanner({
  discountPercent,
  className,
}: SaudiNationalDayBannerProps) {
  const { t } = useLocale();
  const offer = t("home.nationalDay.offer").replace("{percent}", String(discountPercent));

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-emerald-800/30 bg-[#006c35]",
        className
      )}
      role="region"
      aria-label={t("home.nationalDay.title")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 12px, rgba(255,255,255,0.35) 12px, rgba(255,255,255,0.35) 13px)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 py-3 text-center sm:flex-row sm:justify-center sm:gap-3 sm:py-3.5">
        <p className="text-[13px] font-semibold tracking-wide text-white/95 sm:text-sm">
          {t("home.nationalDay.title")}
        </p>
        <span className="hidden h-1 w-1 rounded-full bg-white/50 sm:block" aria-hidden />
        <p className="text-[13px] text-white/85 sm:text-sm">{offer}</p>
      </div>
    </div>
  );
}
