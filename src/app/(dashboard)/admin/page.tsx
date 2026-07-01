import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getVisitStatusBadgeClass } from "@/lib/visit-status";
import { getDashboardTranslator } from "@/i18n/server";
import { getTranslatedVisitStatusLabel } from "@/lib/visit-status-i18n";

export const revalidate = 0;

type ActivityRow = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

type SiteTrafficSummary = {
  today_views: number | string | null;
  week_views: number | string | null;
  total_views: number | string | null;
  today_unique: number | string | null;
  week_unique: number | string | null;
  total_unique: number | string | null;
};

export default async function AdminOverviewPage() {
  const { t } = await getDashboardTranslator();
  const supabase = createAdminClient();

  const [
    { count: pendingPropertyAgents },
    { count: pendingVisitingAgents },
    { count: approvedPropertyAgents },
    { count: approvedVisitingAgents },
    { count: totalProperties },
    { count: activeProperties },
    { count: pendingProperties },
    { count: pendingVisits },
    { count: productContactClicks },
    { count: pendingMaintenance },
    { count: totalCustomers },
    { data: activity },
    { count: totalConfirmedVisits },
    { data: allVisitsData },
  ] = await Promise.all([
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "pending").neq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "pending").eq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "approved").neq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "approved").eq("agent_type", "visiting"),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("product_contact_events").select("id", { count: "exact", head: true }),
    supabase.from("maintenance_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("audit_log")
      .select("id, action, entity_type, created_at, profiles:actor_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("visit_requests").select("status"),
  ]);

  const activityRows = (activity as ActivityRow[] | null) || [];

  const allTimeRows = (allVisitsData || []) as { status: string }[];
  const summaryCounts = {
    pending: allTimeRows.filter((row) => row.status === "pending").length,
    assigned: allTimeRows.filter((row) => row.status === "assigned").length,
    confirmed: allTimeRows.filter((row) => row.status === "confirmed").length,
    cancelled: allTimeRows.filter((row) => row.status === "cancelled").length,
    completed: allTimeRows.filter((row) => row.status === "completed").length,
  };

  const { data: trafficSummary } = await supabase.rpc("get_site_traffic_summary");
  const traffic = (Array.isArray(trafficSummary) ? trafficSummary[0] : trafficSummary) as SiteTrafficSummary | null;

  const todayViews = Number(traffic?.today_views || 0);
  const weekViews = Number(traffic?.week_views || 0);
  const totalViews = Number(traffic?.total_views || 0);
  const todayUnique = Number(traffic?.today_unique || 0);
  const weekUnique = Number(traffic?.week_unique || 0);
  const totalUnique = Number(traffic?.total_unique || 0);

  const visitStatuses = Object.keys(summaryCounts);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.overview.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.overview.subtitle")}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("admin.overview.actionRequired")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Link href="/admin/properties?status=pending" className="block">
            <StatCard
              title={t("admin.overview.pendingProperties")}
              value={pendingProperties || 0}
              description={t("admin.overview.awaitingApproval")}
            />
          </Link>
          <StatCard title={t("admin.overview.pendingAgents")} value={pendingPropertyAgents || 0} />
          <StatCard title={t("admin.overview.pendingVisiting")} value={pendingVisitingAgents || 0} />
          <StatCard title={t("admin.overview.pendingVisits")} value={pendingVisits || 0} />
          <StatCard title={t("admin.overview.pendingMaintenance")} value={pendingMaintenance || 0} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("admin.overview.platformTotals")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title={t("admin.overview.activeProperties")}
            value={activeProperties || 0}
            description={t("admin.overview.totalCount", { count: totalProperties || 0 })}
          />
          <StatCard
            title={t("admin.overview.propertyAgents")}
            value={approvedPropertyAgents || 0}
            description={t("admin.overview.approved")}
          />
          <StatCard
            title={t("admin.overview.visitingTeam")}
            value={approvedVisitingAgents || 0}
            description={t("admin.overview.approved")}
          />
          <StatCard title={t("admin.overview.customers")} value={totalCustomers || 0} />
          <Link href="/admin/visits?status=confirmed" className="block">
            <StatCard
              title={t("admin.overview.confirmedVisits")}
              value={totalConfirmedVisits || 0}
              description={t("admin.overview.allTime")}
            />
          </Link>
          <Link href="/admin/leads" className="block">
            <StatCard
              title={t("admin.overview.productContactClicks")}
              value={productContactClicks || 0}
              description={t("admin.overview.productContactDescription")}
            />
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {t("admin.overview.siteTraffic")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title={t("admin.overview.today")}
            value={todayUnique || 0}
            description={t("admin.overview.uniqueVisitorsViews", { views: todayViews.toLocaleString() })}
          />
          <StatCard
            title={t("admin.overview.last7Days")}
            value={weekUnique || 0}
            description={t("admin.overview.uniqueVisitorsViews", { views: weekViews.toLocaleString() })}
          />
          <StatCard
            title={t("common.total")}
            value={totalUnique || 0}
            description={t("admin.overview.uniqueVisitorsViews", { views: totalViews.toLocaleString() })}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("admin.visits.allTimeSummary")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t("common.status")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("admin.visits.count")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summaryCounts).map(([status, count]) => (
                  <tr key={status} className="border-t">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getVisitStatusBadgeClass(status)}>
                        {getTranslatedVisitStatusLabel(t, status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{count}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/20">
                  <td className="px-4 py-3 font-semibold">{t("common.total")}</td>
                  <td className="px-4 py-3 text-right font-semibold">{allTimeRows.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-md border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t("admin.visits.color")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("admin.visits.meaning")}</th>
                </tr>
              </thead>
              <tbody>
                {visitStatuses.map((status) => (
                  <tr key={status} className="border-t">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getVisitStatusBadgeClass(status)}>
                        {getTranslatedVisitStatusLabel(t, status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t("admin.visits.statusVisits", { status: getTranslatedVisitStatusLabel(t, status) })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ActivityFeed entries={activityRows} />
    </div>
  );
}
