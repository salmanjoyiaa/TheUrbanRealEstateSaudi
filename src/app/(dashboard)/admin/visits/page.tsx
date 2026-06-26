import { Badge } from "@/components/ui/badge";
import { AdminVisitsTable } from "@/components/admin/admin-visits-table";
import { SendDayVisits } from "@/components/admin/send-day-visits";
import { VisitExportPanel } from "@/components/admin/visit-export-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePropertyRefQuery } from "@/lib/property-ref";
import {
  fetchAdminVisitsForPage,
  type AdminVisitRow,
} from "@/lib/server/admin-visits-query";
import { VISIT_STATUS_LABELS, getVisitStatusBadgeClass } from "@/lib/visit-status";

type AssignedVisitSlot = {
  id: string;
  visit_date: string;
  visit_time: string;
  visiting_agent_id: string;
};

function normalizeVisitTime(time: string): string {
  return String(time || "").slice(0, 5);
}

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
    property_ref?: string;
    view?: string;
  };
}) {
  const supabase = createAdminClient();
  const propertyRefQ = sanitizePropertyRefQuery(searchParams.property_ref);

  const rows = await fetchAdminVisitsForPage(supabase, {
    status: searchParams.status,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
    sort: searchParams.sort,
    property_ref: searchParams.property_ref,
  });

  const assignedBySlot = new Map<string, Array<{ visitId: string; agentId: string }>>();
  const { data: assignedSlotsData } = await supabase
    .from("visit_requests")
    .select("id, visit_date, visit_time, visiting_agent_id")
    .in("status", ["assigned", "confirmed"])
    .not("visiting_agent_id", "is", null);
  const assignedEntries = (assignedSlotsData || []) as AssignedVisitSlot[];
  for (const entry of assignedEntries) {
    const key = `${entry.visit_date}|${normalizeVisitTime(entry.visit_time)}`;
    const bucket = assignedBySlot.get(key) || [];
    bucket.push({ visitId: entry.id, agentId: entry.visiting_agent_id });
    assignedBySlot.set(key, bucket);
  }

  const busyAgentIdsForVisit = (row: AdminVisitRow): string[] => {
    const key = `${row.visit_date}|${normalizeVisitTime(row.visit_time)}`;
    const assignments = assignedBySlot.get(key) || [];
    return assignments
      .filter((a) => a.visitId !== row.id)
      .map((a) => a.agentId);
  };

  const rowsWithBusy = rows.map((r) => ({ ...r, busyAgentIds: busyAgentIdsForVisit(r) }));

  const { data: allStatuses } = await supabase.from("visit_requests").select("status");
  const allTimeRows = (allStatuses || []) as { status: string }[];

  const summaryCounts = {
    pending: allTimeRows.filter((row) => row.status === "pending").length,
    assigned: allTimeRows.filter((row) => row.status === "assigned").length,
    confirmed: allTimeRows.filter((row) => row.status === "confirmed").length,
    cancelled: allTimeRows.filter((row) => row.status === "cancelled").length,
    completed: allTimeRows.filter((row) => row.status === "completed").length,
  };

  const { data: agentsData } = await supabase
    .from("agents")
    .select("profile_id, profiles:profile_id(full_name)")
    .eq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitingAgents = (agentsData || []).map((agent: any) => ({
    id: agent.profile_id,
    name: agent.profiles?.full_name || "Unknown",
  }));

  const { data: propAgentsData } = await supabase
    .from("agents")
    .select("id, profiles:profile_id(full_name)")
    .neq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyAgents = (propAgentsData || []).map((a: any) => ({
    id: a.id,
    name: a.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Orchestrate and route scheduled visits.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <VisitExportPanel visitingAgents={visitingAgents} />
        <SendDayVisits visitingAgents={visitingAgents} propertyAgents={propertyAgents} />
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-navy">All-time Visit Summary</h2>
          <p className="text-xs text-muted-foreground">Overall status breakdown across all visit requests.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summaryCounts).map(([status, count]) => (
                  <tr key={status} className="border-t">
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={getVisitStatusBadgeClass(status)}>
                        {VISIT_STATUS_LABELS[status] || status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{count}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/20">
                  <td className="px-3 py-2 font-semibold">Total</td>
                  <td className="px-3 py-2 text-right font-semibold">{allTimeRows.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Color</th>
                  <th className="px-3 py-2 text-left font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(VISIT_STATUS_LABELS).map((status) => (
                  <tr key={status} className="border-t">
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={getVisitStatusBadgeClass(status)}>
                        {VISIT_STATUS_LABELS[status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{VISIT_STATUS_LABELS[status]} visits</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Property ID</label>
          <input
            type="search"
            name="property_ref"
            defaultValue={searchParams.property_ref || ""}
            placeholder="e.g. 55"
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm sm:w-36"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Visit From</label>
          <input
            type="date"
            name="date_from"
            defaultValue={searchParams.date_from || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Visit To</label>
          <input
            type="date"
            name="date_to"
            defaultValue={searchParams.date_to || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Sort</label>
          <select
            name="sort"
            defaultValue={searchParams.sort || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Newest First</option>
            <option value="visit_date_asc">Visit Date ↑</option>
            <option value="visit_date_desc">Visit Date ↓</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
        <a
          href="/admin/visits"
          className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium inline-flex items-center hover:bg-muted"
        >
          Reset
        </a>
      </form>

      {propertyRefQ ? (
        <p className="text-sm text-muted-foreground">
          Visits for Property ID &quot;{propertyRefQ}&quot; ({rowsWithBusy.length}{" "}
          {rowsWithBusy.length === 1 ? "request" : "requests"})
        </p>
      ) : null}

      <AdminVisitsTable
        rows={rowsWithBusy}
        visitingAgents={visitingAgents}
        pageSize={10}
        defaultView={searchParams.view === "table" ? "table" : "day"}
        sortMode={searchParams.sort || ""}
      />
    </div>
  );
}
