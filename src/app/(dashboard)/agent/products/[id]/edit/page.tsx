import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/product/product-form";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getDashboardTranslator } from "@/i18n/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentEditProductPage(props: PageProps) {
  const params = await props.params;
  const { t } = await getDashboardTranslator();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, agent_type")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; agent_type: string } | null };

  if (!agent) redirect("/pending-approval");
  if (agent.agent_type !== "seller") redirect("/agent");

  const { data } = (await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single()) as { data: Product | null };

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">{t("agent.products.editTitle")}</h1>
      <ProductForm mode="edit" initialData={data} />
    </div>
  );
}
