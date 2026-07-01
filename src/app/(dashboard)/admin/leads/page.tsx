import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { getDashboardTranslator } from "@/i18n/server";

type ContactRow = {
  id: string;
  channel: string;
  created_at: string;
  products: {
    title: string;
  } | null;
};

export default async function AdminProductContactsPage() {
  const { t } = await getDashboardTranslator();
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("product_contact_events")
    .select(
      `
      id,
      channel,
      created_at,
      products:product_id (title)
    `
    )
    .order("created_at", { ascending: false })
    .limit(500)) as { data: ContactRow[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.leads.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.leads.subtitle")}</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "created_at", title: "Time", render: (row) => formatDate(row.created_at) },
          { key: "product", title: "Product", render: (row) => row.products?.title || "—" },
          {
            key: "channel",
            title: "Channel",
            render: (row) => (
              <Badge variant="outline" className="capitalize">
                {row.channel === "whatsapp" ? "WhatsApp" : "Phone"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
