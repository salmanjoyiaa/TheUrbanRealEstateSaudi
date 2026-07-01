import { resolvePublicLocale, getDashboardLanguage } from "@/lib/platform-language";
import { getMessages } from "@/i18n/get-messages";
import { createTranslator, type Translator } from "@/i18n/create-translator";

export async function getPublicTranslator(): Promise<{
  locale: Awaited<ReturnType<typeof resolvePublicLocale>>;
  t: Translator;
}> {
  const locale = await resolvePublicLocale();
  const messages = await getMessages(locale, "public");
  return { locale, t: createTranslator(messages) };
}

export async function getDashboardTranslator(): Promise<{
  locale: Awaited<ReturnType<typeof getDashboardLanguage>>;
  t: Translator;
}> {
  const locale = await getDashboardLanguage();
  const messages = await getMessages(locale, "dashboard");
  return { locale, t: createTranslator(messages) };
}
