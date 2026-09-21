"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaudiFlag, SaudiFlagChip } from "@/components/home/saudi-flag";
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

  return (
    <div
      className={cn(
        "animate-fade-in-up group relative overflow-hidden rounded-[1.75rem]",
        "border border-white/[0.12] bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-[#006c35]/20",
        "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        "backdrop-blur-xl",
        className
      )}
      style={{ animationDelay: "0.45s" }}
      role="region"
      aria-label={t("home.nationalDay.title")}
    >
      {/* Ambient light */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#006c35]/45 blur-[110px] animate-national-day-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]"
        aria-hidden
      />
      {/* Light sweep */}
      <div
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-national-day-sweep"
        aria-hidden
      />
      {/* Top highlight */}
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent"
        aria-hidden
      />

      <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto_auto] lg:items-center lg:gap-10 lg:p-9">
        {/* Flag */}
        <div className="flex justify-start lg:justify-center">
          <div className="relative animate-national-day-float">
            <div
              className="absolute -inset-3 rounded-2xl bg-[#006c35]/40 blur-2xl"
              aria-hidden
            />
            <div className="relative w-[9.5rem] overflow-hidden rounded-xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/25 sm:w-[11rem]">
              <SaudiFlag sheen className="h-auto w-full" />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <SaudiFlagChip />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200/95">
              {t("home.nationalDay.eyebrow")}
            </span>
          </div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem] sm:leading-tight">
            {t("home.nationalDay.title")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/65 sm:text-[15px]">
            {t("home.nationalDay.subtitle")}
          </p>
        </div>

        {/* Discount */}
        <div className="flex items-center gap-6">
          <div
            className="hidden h-16 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent lg:block"
            aria-hidden
          />
          <div className="flex flex-col items-start lg:items-end">
            <p
              className="bg-gradient-to-b from-white via-emerald-50 to-emerald-200/90 bg-clip-text text-[3.5rem] font-semibold leading-none tracking-[-0.045em] text-transparent tabular-nums sm:text-6xl lg:text-[4.25rem]"
              aria-hidden
            >
              {discountPercent}
              <span className="ml-0.5 text-[0.5em] font-medium tracking-normal">%</span>
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              {t("home.nationalDay.offLabel")}
            </p>
            <span className="sr-only">
              {t("home.nationalDay.offer").replace("{percent}", String(discountPercent))}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full lg:w-auto">
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-xl bg-white px-7 text-[15px] font-semibold text-[#00512a] shadow-[0_10px_36px_-10px_rgba(255,255,255,0.45)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-emerald-50 hover:shadow-[0_14px_44px_-10px_rgba(0,108,53,0.45)] active:scale-[0.98] lg:w-auto"
          >
            <Link href="/properties" className="inline-flex items-center gap-2">
              {t("home.nationalDay.cta")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
