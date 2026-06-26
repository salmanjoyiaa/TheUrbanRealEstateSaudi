import { createRouteClient } from "@/lib/supabase/route";

export async function getApprovedVisitingAgent() {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      profileId: null as string | null,
      error: "Unauthorized",
      status: 401,
    };
  }

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, status, agent_type")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; status: string; agent_type: string } | null };

  if (!agent || agent.status !== "approved") {
    return {
      supabase,
      profileId: null as string | null,
      error: "Agent not approved",
      status: 403,
    };
  }

  if (agent.agent_type !== "visiting") {
    return {
      supabase,
      profileId: null as string | null,
      error: "Only visiting agents can manage message templates",
      status: 403,
    };
  }

  return { supabase, profileId: user.id, error: null, status: 200 };
}
