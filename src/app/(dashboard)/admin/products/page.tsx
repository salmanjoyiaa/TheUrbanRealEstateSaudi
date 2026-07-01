import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSAR } from "@/lib/format";
import { ProductActions } from "@/components/admin/product-actions";
import { getDashboardTranslator } from "@/i18n/server";

type Row = {
  id: string;
  title: string;
  city: string;
  condition: string;
  price: number;
  is_available: boolean;
  agents: {
    profiles: {
      full_name: string;
    } | null;
  } | null;
};

export default async function AdminProductsPage() {
  const { t } = await getDashboardTranslator();
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("products")
    .select("id, title, city, condition, price, is_available, agents:agent_id(profiles:profile_id(full_name))")
    .order("created_at", { ascending: false })) as { data: Row[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.products.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.products.subtitle")}</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "title", title: "Title" },
          { key: "city", title: "City" },
          { key: "agent", title: "Listed By", render: (row) => row.agents?.profiles?.full_name || "—" },
          { key: "condition", title: "Condition", render: (row) => row.condition.replaceAll("_", " ") },
          { key: "price", title: "Price", render: (row) => formatSAR(row.price) },
          {
            key: "is_available",
            title: "Availability",
            render: (row) => <Badge>{row.is_available ? "Available" : "Hidden"}</Badge>,
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => <ProductActions id={row.id} title={row.title} />,
          },
        ]}
      />
    </div>
  );
}
