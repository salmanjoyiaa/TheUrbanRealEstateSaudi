import type { SiteLanguage } from "@/lib/platform-language";

export type MessageNamespace = "public" | "dashboard";

export interface MessageTree {
  [key: string]: string | MessageTree;
}

const cache = new Map<string, MessageTree>();

export async function getMessages(
  locale: SiteLanguage,
  namespace: MessageNamespace
): Promise<MessageTree> {
  const cacheKey = `${locale}:${namespace}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const messages = (await import(`./messages/${locale}/${namespace}.json`)).default as MessageTree;
  cache.set(cacheKey, messages);
  return messages;
}

export function resolveMessage(messages: MessageTree, key: string): string | undefined {
  const parts = key.split(".");
  let current: string | MessageTree | undefined = messages;

  for (const part of parts) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}
