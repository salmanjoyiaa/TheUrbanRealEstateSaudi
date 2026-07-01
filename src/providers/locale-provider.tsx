"use client";

import { createContext, useContext, useMemo } from "react";
import type { SiteLanguage } from "@/lib/platform-language";
import { createTranslator, getDir, getFontClass, type Translator } from "@/i18n/create-translator";
import type { MessageTree } from "@/i18n/get-messages";

type LocaleContextValue = {
  locale: SiteLanguage;
  dir: "ltr" | "rtl";
  fontClass: string;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: SiteLanguage;
  messages: MessageTree;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      dir: getDir(locale),
      fontClass: getFontClass(locale),
      t: createTranslator(messages),
    }),
    [locale, messages]
  );

  return (
    <LocaleContext.Provider value={value}>
      <div lang={locale} dir={value.dir} className={value.fontClass}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useOptionalLocale() {
  return useContext(LocaleContext);
}
