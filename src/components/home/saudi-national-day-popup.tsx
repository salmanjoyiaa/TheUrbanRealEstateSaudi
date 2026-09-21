"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaudiFlag, SaudiFlagChip } from "@/components/home/saudi-flag";
import { useLocale } from "@/providers/locale-provider";

const STORAGE_KEY = "us-national-day-popup-v2";

type SaudiNationalDayPopupProps = {
  discountPercent: number;
};

export function SaudiNationalDayPopup({ discountPercent }: SaudiNationalDayPopupProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    const timer = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent
        className="max-h-[calc(100vh-1.5rem)] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[430px] [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_100px_-20px_rgba(0,40,20,0.6)] ring-1 ring-black/5">
          {/* Flag header */}
          <div className="relative h-44 overflow-hidden bg-[#006c35] sm:h-48">
            <SaudiFlag sheen cover decorative className="h-full w-full" />
            {/* Ambient light + sweep */}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18),transparent_55%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-national-day-sweep"
              aria-hidden
            />
            {/* Fade into content */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white to-transparent"
              aria-hidden
            />

            <DialogClose asChild>
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/90 backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-black/30 active:scale-95"
                aria-label={t("home.nationalDay.popupDismiss")}
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          {/* Content */}
          <div className="relative px-6 pb-6 pt-1 text-center sm:px-8 sm:pb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#006c35]/15 bg-[#006c35]/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006c35]">
              <SaudiFlagChip className="ring-[#006c35]/20" />
              {t("home.nationalDay.eyebrow")}
            </div>

            <DialogTitle className="mt-3.5 text-balance text-[1.55rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.75rem]">
              {t("home.nationalDay.popupGreeting")}
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-[21rem] text-[14.5px] leading-relaxed text-slate-600">
              {t("home.nationalDay.popupMessage").replace(
                "{percent}",
                String(discountPercent)
              )}
            </DialogDescription>

            {/* Offer tile */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#006c35] to-[#004d26] px-6 py-3.5 text-left shadow-[0_16px_40px_-16px_rgba(0,108,53,0.6)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  {t("home.nationalDay.popupOfferLabel")}
                </p>
                <p className="mt-0.5 text-sm font-medium text-white/90">
                  {t("home.nationalDay.offLabel")}
                </p>
              </div>
              <p className="text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums">
                {discountPercent}
                <span className="text-[0.5em] font-medium">%</span>
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-xl bg-[#006c35] text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,108,53,0.7)] transition-[transform,background-color] duration-150 hover:bg-[#00602f] active:scale-[0.98]"
              >
                <Link href="/properties" onClick={dismiss}>
                  {t("home.nationalDay.popupCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <button
                type="button"
                onClick={dismiss}
                className="h-10 w-full rounded-xl text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900"
              >
                {t("home.nationalDay.popupDismiss")}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
