import type { Translator } from "@/i18n/create-translator";

export function getTranslatedVisitStatusLabel(t: Translator, status: string): string {
  const key = `visitStatus.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

export function getTranslatedPipelineLabel(t: Translator, status: string): string {
  const key = `pipeline.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}
