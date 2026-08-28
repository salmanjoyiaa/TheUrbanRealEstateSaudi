import { NextResponse } from "next/server";
import { getAdminRouteContext } from "@/lib/admin";
import { getDocumentDownloadResponse, getManualDocument } from "@/lib/server/manual-document";
import { sanitizeInvoiceFileName } from "@/lib/manual-invoice";
import { sanitizeManualReceiptFileName } from "@/lib/manual-receipt";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const doc = await getManualDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const fileName =
    doc.document_type === "invoice"
      ? sanitizeInvoiceFileName(doc.document_number)
      : sanitizeManualReceiptFileName(
          doc.document_number,
          doc.property_ref,
          doc.document_date ?? undefined
        );

  return getDocumentDownloadResponse(id, fileName);
}
