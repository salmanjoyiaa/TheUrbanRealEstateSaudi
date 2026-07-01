import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceServiceForm } from "@/components/agent/maintenance-service-form";
import { getDashboardTranslator } from "@/i18n/server";

export default async function AgentNewMaintenanceServicePage() {
  const { t } = await getDashboardTranslator();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, agent_type, status")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; agent_type: string; status: string } | null };

  if (!agent || agent.status !== "approved") redirect("/pending-approval");
  if (agent.agent_type !== "maintenance") redirect("/agent");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("agent.maintenanceServices.newTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("agent.maintenanceServices.newSubtitle")}</p>
      </div>
      <MaintenanceServiceForm mode="create" />
    </div>
  );
}
