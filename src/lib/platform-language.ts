import { createAdminClient } from "@/lib/supabase/admin";

export type SiteLanguage = "en" | "ar";

export const DEFAULT_SITE_LANGUAGE: SiteLanguage = "en";

export function sanitizeSiteLanguage(value: unknown, fallback: SiteLanguage = DEFAULT_SITE_LANGUAGE): SiteLanguage {
  return value === "ar" ? "ar" : value === "en" ? "en" : fallback;
}

async function getPlatformSetting(key: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()) as { data: { value: string } | null };

  return data?.value ?? null;
}

export async function getPublicSiteLanguage(): Promise<SiteLanguage> {
  const value = await getPlatformSetting("public_site_language");
  return sanitizeSiteLanguage(value);
}

export async function getDashboardLanguage(): Promise<SiteLanguage> {
  const value = await getPlatformSetting("dashboard_language");
  return sanitizeSiteLanguage(value);
}

export async function getPlatformLanguages(): Promise<{
  public_site_language: SiteLanguage;
  dashboard_language: SiteLanguage;
}> {
  const [publicLang, dashboardLang] = await Promise.all([
    getPublicSiteLanguage(),
    getDashboardLanguage(),
  ]);
  return {
    public_site_language: publicLang,
    dashboard_language: dashboardLang,
  };
}
