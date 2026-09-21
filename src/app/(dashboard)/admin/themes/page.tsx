import { Palette } from "lucide-react";
import { themeRegistry } from "@/config/themes";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const { t } = await getDashboardTranslator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.themes.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.themes.subtitle")}</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <Palette className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{t("admin.themes.hint")}</p>
      </div>

      <div className="space-y-8">
        {themeRegistry.map((theme) => (
          <section key={theme.id} className="space-y-3" aria-labelledby={`theme-${theme.id}`}>
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background"
                style={{ backgroundColor: theme.accent, boxShadow: `0 0 0 2px ${theme.accent}33` }}
                aria-hidden
              />
              <div>
                <h2 id={`theme-${theme.id}`} className="text-base font-semibold text-foreground">
                  {t(theme.nameKey)}
                </h2>
                <p className="text-xs text-muted-foreground">{t(theme.descriptionKey)}</p>
              </div>
            </div>
            <theme.SettingsForm />
          </section>
        ))}
      </div>
    </div>
  );
}
