import { PropertyForm } from "@/components/property/property-form";
import { getDashboardTranslator } from "@/i18n/server";

export default async function AgentNewPropertyPage() {
  const { t } = await getDashboardTranslator();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">{t("agent.properties.createTitle")}</h1>
      <PropertyForm mode="create" />
    </div>
  );
}
