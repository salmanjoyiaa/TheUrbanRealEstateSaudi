"use client";

import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale } from "@/providers/locale-provider";
import { publicNavKeys } from "@/config/nav";

export function PublicSiteHeader() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 py-6 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-5 lg:px-12">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="group flex items-center">
            <span className="text-[22px] font-black leading-none tracking-tight text-foreground md:text-[26px]">
              TheUrbanRealEstate<span className="text-[26px] font-black md:text-[30px]">Saudi</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex md:gap-8" aria-label="Main navigation">
          {publicNavKeys.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground"
            >
              {t(link.titleKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground shadow-[0_4px_6px_-1px_hsl(var(--primary)/0.2)] transition-all hover:bg-primary/90 md:inline-flex"
          >
            {t("nav.agentLogin")}
          </Link>
        </div>
      </div>
    </header>
  );
}
