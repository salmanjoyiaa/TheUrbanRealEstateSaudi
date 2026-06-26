import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VisitMessageTemplateManager } from "@/components/visit/visit-message-template-manager";

export const metadata: Metadata = {
  title: "Message Templates - Agent Dashboard",
};

export const revalidate = 0;

export default async function AgentMessageTemplatesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agentData } = await supabase
    .from("agents")
    .select("id, agent_type, status")
    .eq("profile_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agent = agentData as any;

  if (!agent || agent.status !== "approved") redirect("/pending-approval");
  if (agent.agent_type !== "visiting") redirect("/agent");

  return <VisitMessageTemplateManager />;
}
