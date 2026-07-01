import { resolveMessage, type MessageTree } from "@/i18n/get-messages";

export type TranslateParams = Record<string, string | number>;

export type Translator = (key: string, params?: TranslateParams) => string;

export function createTranslator(messages: MessageTree): Translator {
  return function t(key: string, params?: TranslateParams): string {
    const template = resolveMessage(messages, key) ?? key;

    if (!params) return template;

    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) =>
        result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue)),
      template
    );
  };
}

export function getDir(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getFontClass(locale: string): string {
  return locale === "ar" ? "font-arabic" : "font-sans";
}
