import { ManualInvoiceForm } from "@/components/admin/manual-invoice-form";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminManualInvoicePage() {
  const { t } = await getDashboardTranslator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.manualInvoice.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.manualInvoice.subtitle")}</p>
      </div>

      <ManualInvoiceForm />
    </div>
  );
}
