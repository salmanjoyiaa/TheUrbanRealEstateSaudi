import { SendDayVisits } from "@/components/admin/send-day-visits";
import { VisitExportPanel } from "@/components/admin/visit-export-panel";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAdminVisitAgents } from "@/lib/server/admin-visit-agents";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminVisitPdfPage() {
  const { t } = await getDashboardTranslator();
  const supabase = createAdminClient();
  const { visitingAgents, propertyAgents } = await fetchAdminVisitAgents(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.visitPdf.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.visitPdf.subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <VisitExportPanel visitingAgents={visitingAgents} />
        <SendDayVisits visitingAgents={visitingAgents} propertyAgents={propertyAgents} />
      </div>
    </div>
  );
}
