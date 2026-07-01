import { LanguageSettingsForm } from "@/components/admin/language-settings-form";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { t } = await getDashboardTranslator();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.settings.subtitle")}</p>
      </div>
      <LanguageSettingsForm />
    </div>
  );
}
