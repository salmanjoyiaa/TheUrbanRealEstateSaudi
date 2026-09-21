import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { LanguageSettingsForm } from "@/components/admin/language-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Palette className="h-4 w-4 text-muted-foreground" aria-hidden />
              </span>
              <div>
                <CardTitle>{t("admin.settings.themesTitle")}</CardTitle>
                <CardDescription className="mt-1.5">{t("admin.settings.themesSubtitle")}</CardDescription>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/themes">
                {t("admin.settings.themesCta")}
                <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0" />
      </Card>
    </div>
  );
}
