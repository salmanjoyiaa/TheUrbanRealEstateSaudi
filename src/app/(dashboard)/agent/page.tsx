import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { VisitDayBoard } from "@/components/visit/visit-day-board";
import { fetchVisitingAgentDashboardData } from "@/lib/visiting-agent-data";
import { getDashboardTranslator } from "@/i18n/server";

export default async function AgentOverviewPage() {
  const { t } = await getDashboardTranslator();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, status, agent_type")
    .eq("profile_id", user.id)
    .single()) as {
      data: { id: string; status: string; agent_type: string } | null;
    };

  if (!agent || agent.status !== "approved") {
    redirect("/pending-approval");
  }

  if (agent.agent_type === "maintenance") {
    const [{ count: servicesListed }, { count: servicesActive }, { count: serviceRequests }] = await Promise.all([
      supabase.from("maintenance_services").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
      supabase
        .from("maintenance_services")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", agent.id)
        .eq("status", "active"),
      supabase
        .from("maintenance_requests")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", agent.id)
        .in("status", ["approved", "completed"]),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{t("agent.overview.titleMaintenance")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("agent.overview.subtitleMaintenance")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title={t("agent.overview.listedServices")} value={servicesListed || 0} />
          <StatCard title={t("agent.overview.activeListings")} value={servicesActive || 0} />
          <StatCard title={t("agent.overview.serviceRequests")} value={serviceRequests || 0} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("agent.overview.approvalStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm capitalize text-muted-foreground">
              {t("agent.overview.currentStatus", { status: agent.status })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [{ count: propertiesCount }, { count: productsCount }] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
  ]);

  const { data: propertyIds } = (await supabase
    .from("properties")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };
  const { data: productIds } = (await supabase
    .from("products")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };

  const visitIdList = (propertyIds || []).map((item) => item.id);
  const leadIdList = (productIds || []).map((item) => item.id);

  const [{ count: confirmedVisits }, { count: confirmedLeads }, { count: propertyAgentVisits }, { count: propertyAgentLeads }] = await Promise.all([
    agent.agent_type === "visiting" ? supabase.from("visit_requests").select("id", { count: "exact", head: true })
      .eq("visiting_agent_id", user.id).eq("status", "confirmed") : Promise.resolve({ count: 0 }),
    agent.agent_type === "visiting" ? supabase.from("visit_requests").select("id", { count: "exact", head: true })
      .eq("visiting_agent_id", user.id).in("visiting_status", ["commission_got", "deal_close"]) : Promise.resolve({ count: 0 }),
    visitIdList.length > 0 ? supabase.from("visit_requests").select("id", { count: "exact", head: true })
      .in("property_id", visitIdList).eq("status", "confirmed") : Promise.resolve({ count: 0 }),
    leadIdList.length > 0
      ? supabase.from("product_contact_events").select("id", { count: "exact", head: true }).in("product_id", leadIdList)
      : Promise.resolve({ count: 0 }),
  ]);

  const [{ count: failedDeals }] = await Promise.all([
    agent.agent_type === "visiting" ? supabase.from("visit_requests").select("id", { count: "exact", head: true })
      .eq("visiting_agent_id", user.id).eq("visiting_status", "deal_fail") : Promise.resolve({ count: 0 }),
  ]);

  const outputVisits = agent.agent_type === "visiting" ? confirmedVisits : propertyAgentVisits;
  const outputLeads = agent.agent_type === "visiting" ? confirmedLeads : propertyAgentLeads;

  const visitingDashboardData =
    agent.agent_type === "visiting"
      ? await fetchVisitingAgentDashboardData(user.id, agent.id)
      : null;

  const { data: profileData } =
    agent.agent_type === "visiting"
      ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
      : { data: null };

  const agentName =
    agent.agent_type === "visiting"
      ? (profileData as { full_name?: string } | null)?.full_name || "Agent"
      : "";

  const overviewTitle =
    agent.agent_type === "seller"
      ? t("agent.overview.titleSeller")
      : agent.agent_type === "visiting"
        ? t("agent.overview.titleVisiting")
        : t("agent.overview.titleDefault");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{overviewTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("agent.overview.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agent.agent_type === "visiting" ? (
          <>
            <StatCard title={t("agent.overview.confirmedVisits")} value={outputVisits || 0} />
            <StatCard title={t("agent.overview.confirmedDeals")} value={outputLeads || 0} />
            <StatCard title={t("agent.overview.failedDeals")} value={failedDeals || 0} />
          </>
        ) : agent.agent_type === "seller" ? (
          <>
            <StatCard title={t("agent.overview.products")} value={productsCount || 0} />
            <StatCard title={t("agent.overview.contactClicks")} value={propertyAgentLeads || 0} />
          </>
        ) : (
          <>
            <StatCard title={t("agent.overview.properties")} value={propertiesCount || 0} />
            <StatCard title={t("agent.overview.confirmedVisits")} value={outputVisits || 0} />
          </>
        )}
      </div>

      {visitingDashboardData && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-navy">{t("agent.overview.todaySchedule")}</h2>
            <p className="text-sm text-muted-foreground">{t("agent.overview.scheduleSubtitle")}</p>
          </div>
          <VisitDayBoard
            rows={visitingDashboardData.rows}
            assignedProperties={visitingDashboardData.assignedProperties}
            assignmentHistoryByVisit={visitingDashboardData.assignmentHistoryByVisit}
            agentName={agentName}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("agent.overview.approvalStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm capitalize text-muted-foreground">
            {t("agent.overview.currentStatus", { status: agent.status })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
