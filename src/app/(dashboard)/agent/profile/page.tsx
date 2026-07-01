import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountProfileForm } from "@/components/dashboard/account-profile-form";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

const AGENT_ROLE_LABELS: Record<string, string> = {
  property: "Property Agent",
  visiting: "Visiting Agent",
  seller: "Seller",
  maintenance: "Maintenance Agent",
};

export default async function AgentProfilePage() {
  const { t } = await getDashboardTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role, created_at")
    .eq("id", user.id)
    .single()) as {
    data: {
      id: string;
      email: string;
      full_name: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      created_at: string;
    } | null;
  };

  if (!profile) {
    redirect("/login");
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("agent_type")
    .eq("profile_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentType = (agent as any)?.agent_type as string | undefined;
  const roleLabel = agentType ? AGENT_ROLE_LABELS[agentType] || "Agent" : "Agent";

  return (
    <AccountProfileForm
      initial={{
        ...profile,
        email: user.email ?? profile.email,
        agent_type: agentType ?? null,
      }}
      roleLabel={roleLabel}
      pageTitle={t("agent.profile.title")}
      pageSubtitle={t("agent.profile.subtitle")}
    />
  );
}
