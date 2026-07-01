"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { SiteLanguage } from "@/lib/platform-language";

type LanguageSwitcherProps = {
  variant?: "default" | "footer" | "homepage";
  className?: string;
};

export function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState<SiteLanguage | null>(null);

  async function setLanguage(next: SiteLanguage) {
    if (next === locale || loading) return;

    setLoading(next);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "public", locale: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to change language");
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const buttonBase =
    variant === "homepage"
      ? "rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
      : variant === "footer"
        ? "rounded-md px-2.5 py-1 text-xs font-semibold transition"
        : "rounded-md px-2.5 py-1 text-xs font-semibold transition";

  const activeHomepage = "bg-white/20 text-white";
  const inactiveHomepage = "text-white/70 hover:bg-white/10 hover:text-white";
  const activeDefault = "bg-primary text-primary-foreground";
  const inactiveDefault = "text-muted-foreground hover:bg-muted hover:text-foreground";

  const isHomepage = variant === "homepage";

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-lg border p-0.5", className, {
        "border-white/20 bg-white/5": isHomepage,
        "border-border bg-muted/30": !isHomepage,
      })}
      role="group"
      aria-label={t("common.language")}
    >
      {(["en", "ar"] as const).map((lang) => {
        const active = locale === lang;
        const label = lang === "en" ? t("common.english") : t("common.arabic");
        return (
          <button
            key={lang}
            type="button"
            disabled={loading !== null}
            onClick={() => void setLanguage(lang)}
            className={cn(
              buttonBase,
              active
                ? isHomepage
                  ? activeHomepage
                  : activeDefault
                : isHomepage
                  ? inactiveHomepage
                  : inactiveDefault,
              loading === lang && "opacity-70"
            )}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
