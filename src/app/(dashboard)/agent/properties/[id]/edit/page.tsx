import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/property/property-form";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/types/database";
import { getDashboardTranslator } from "@/i18n/server";

type PageProps = {
  params: { id: string };
};

export default async function AgentEditPropertyPage({ params }: PageProps) {
  const { t } = await getDashboardTranslator();
  const supabase = await createClient();
  const { data } = (await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single()) as { data: Property | null };

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">{t("agent.properties.editTitle")}</h1>
      <PropertyForm mode="edit" initialData={data} />
    </div>
  );
}
