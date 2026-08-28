import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/property/property-form";
import type { Property } from "@/types/database";
import { getDashboardTranslator } from "@/i18n/server";

export default async function AdminEditPropertyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { t } = await getDashboardTranslator();
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: property, error } = (await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .single()) as { data: Property | null; error: unknown };

    if (error || !property) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">{t("admin.properties.editTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("admin.properties.editSubtitle")}</p>
            </div>

            <PropertyForm
                mode="edit"
                initialData={property}
                submitEndpoint={`/api/admin/properties/${property.id}`}
                redirectPath="/admin/properties"
            />
        </div>
    );
}
