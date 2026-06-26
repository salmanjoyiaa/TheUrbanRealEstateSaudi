import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export type AdminVisitAgent = { id: string; name: string };

export async function fetchAdminVisitAgents(supabase: AdminClient): Promise<{
  visitingAgents: AdminVisitAgent[];
  propertyAgents: AdminVisitAgent[];
}> {
  const [{ data: agentsData }, { data: propAgentsData }] = await Promise.all([
    supabase
      .from("agents")
      .select("profile_id, profiles:profile_id(full_name)")
      .eq("agent_type", "visiting")
      .eq("status", "approved"),
    supabase
      .from("agents")
      .select("id, profiles:profile_id(full_name)")
      .neq("agent_type", "visiting")
      .eq("status", "approved"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitingAgents = (agentsData || []).map((agent: any) => ({
    id: agent.profile_id as string,
    name: agent.profiles?.full_name || "Unknown",
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyAgents = (propAgentsData || []).map((a: any) => ({
    id: a.id as string,
    name: a.profiles?.full_name || "Unknown",
  }));

  return { visitingAgents, propertyAgents };
}
