import { ManualReceiptForm } from "@/components/admin/manual-receipt-form";
import { getDashboardTranslator } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminManualReceiptPage() {
  const { t } = await getDashboardTranslator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.manualReceipt.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.manualReceipt.subtitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("admin.receiptSlip.disclaimer")}</p>
      </div>

      <ManualReceiptForm />
    </div>
  );
}
