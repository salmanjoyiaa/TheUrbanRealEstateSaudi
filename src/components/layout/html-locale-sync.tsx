"use client";

import { useEffect } from "react";
import { useLocale } from "@/providers/locale-provider";

export function HtmlLocaleSync() {
  const { locale, dir } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
