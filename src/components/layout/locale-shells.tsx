import { resolvePublicLocale, getDashboardLanguage, type SiteLanguage } from "@/lib/platform-language";
import { getMessages } from "@/i18n/get-messages";
import { LocaleProvider } from "@/providers/locale-provider";
import { HtmlLocaleSync } from "@/components/layout/html-locale-sync";

export async function PublicLocaleShell({ children }: { children: React.ReactNode }) {
  const locale = await resolvePublicLocale();
  const messages = await getMessages(locale, "public");
  return (
    <LocaleProvider locale={locale} messages={messages}>
      <HtmlLocaleSync />
      {children}
    </LocaleProvider>
  );
}

export async function DashboardLocaleShell({ children }: { children: React.ReactNode }) {
  const locale = await getDashboardLanguage();
  const messages = await getMessages(locale, "dashboard");
  return (
    <LocaleProvider locale={locale} messages={messages}>
      {children}
    </LocaleProvider>
  );
}

export type { SiteLanguage };
