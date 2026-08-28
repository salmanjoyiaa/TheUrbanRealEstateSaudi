import { DocumentsFilterTable } from "@/components/admin/documents-filter-table";
import { getDashboardTranslator } from "@/i18n/server";
import { listManualDocuments, type ManualDocumentType } from "@/lib/server/manual-document";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    type?: string;
    property_ref?: string;
  }>;
};

export default async function AdminDocumentsPage({ searchParams }: PageProps) {
  const { t } = await getDashboardTranslator();
  const params = (await searchParams) ?? {};
  const typeParam = params.type === "invoice" || params.type === "receipt" ? params.type : "all";
  const propertyRef = params.property_ref?.trim() ?? "";

  const rows = await listManualDocuments({
    documentType: typeParam === "all" ? undefined : (typeParam as ManualDocumentType),
    propertyRef: propertyRef || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{t("admin.documents.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.documents.subtitle")}</p>
      </div>

      <DocumentsFilterTable
        currentType={typeParam}
        propertyRef={propertyRef}
        rows={rows}
        labels={{
          all: t("admin.documents.all"),
          invoices: t("admin.documents.invoices"),
          receipts: t("admin.documents.receipts"),
          propertyRef: t("admin.documents.propertyRef"),
          filter: t("admin.documents.filter"),
          type: t("admin.documents.type"),
          documentNumber: t("admin.documents.documentNumber"),
          property: t("admin.documents.property"),
          customer: t("admin.documents.customer"),
          documentDate: t("admin.documents.documentDate"),
          amount: t("admin.documents.amount"),
          createdAt: t("admin.documents.createdAt"),
          actions: t("admin.documents.actions"),
          download: t("admin.documents.download"),
          empty: t("admin.documents.empty"),
          invoice: t("admin.documents.invoice"),
          receipt: t("admin.documents.receipt"),
        }}
      />
    </div>
  );
}
