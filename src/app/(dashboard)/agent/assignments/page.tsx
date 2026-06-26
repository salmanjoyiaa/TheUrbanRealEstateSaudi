import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitingAgentClient } from "@/components/visit/visiting-agent-client";
import { fetchVisitingAgentDashboardData } from "@/lib/visiting-agent-data";

export default async function AgentAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agentData } = await supabase
    .from("agents")
    .select("id, agent_type")
    .eq("profile_id", user.id)
    .single();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agent = agentData as any;
  const agentName = (profileData as { full_name?: string } | null)?.full_name || "Agent";

  if (!agent || agent.agent_type !== "visiting") {
    redirect("/agent");
  }

  const { rows, assignedProperties, assignmentHistoryByVisit } =
    await fetchVisitingAgentDashboardData(user.id, agent.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Assignments</h1>
        <p className="text-sm text-muted-foreground">
          View your daily visits and manage each assignment.
        </p>
      </div>

      <VisitingAgentClient
        rows={rows}
        assignedProperties={assignedProperties}
        assignmentHistoryByVisit={assignmentHistoryByVisit}
        agentName={agentName}
      />
    </div>
  );
}
