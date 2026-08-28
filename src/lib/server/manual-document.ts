import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, ManualDocument } from "@/types/database";

export const MANUAL_DOCUMENTS_BUCKET = "manual-documents";

export type ManualDocumentType = "invoice" | "receipt";

export type ManualDocumentRow = ManualDocument;

export type SaveManualDocumentInput = {
  documentType: ManualDocumentType;
  documentNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  propertyId?: string | null;
  propertyRef?: string | null;
  propertyName?: string | null;
  documentDate?: string | null;
  totalAmount?: number | null;
  formData: Record<string, unknown>;
  pdfBuffer: Buffer;
  createdBy: string;
};

function buildPdfPath(documentType: ManualDocumentType, id: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${documentType}/${year}/${month}/${id}.pdf`;
}

export async function saveManualDocument(
  input: SaveManualDocumentInput
): Promise<{ id: string; pdfPath: string }> {
  const supabase = createAdminClient();
  const id = crypto.randomUUID();
  const pdfPath = buildPdfPath(input.documentType, id);

  const { error: uploadError } = await supabase.storage
    .from(MANUAL_DOCUMENTS_BUCKET)
    .upload(pdfPath, input.pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Table exists after migration; cast until generated types are refreshed.
  const { error: insertError } = await supabase.from("manual_documents").insert({
    id,
    document_type: input.documentType,
    document_number: input.documentNumber,
    customer_name: input.customerName,
    customer_email: input.customerEmail ?? null,
    customer_phone: input.customerPhone ?? null,
    customer_address: input.customerAddress ?? null,
    property_id: input.propertyId ?? null,
    property_ref: input.propertyRef ?? null,
    property_name: input.propertyName ?? null,
    document_date: input.documentDate ?? null,
    total_amount: input.totalAmount ?? null,
    form_data: input.formData as Json,
    pdf_path: pdfPath,
    created_by: input.createdBy,
  } as never);

  if (insertError) {
    await supabase.storage.from(MANUAL_DOCUMENTS_BUCKET).remove([pdfPath]);
    throw new Error(insertError.message);
  }

  return { id, pdfPath };
}

export async function listManualDocuments(options?: {
  documentType?: ManualDocumentType;
  propertyRef?: string;
  limit?: number;
}): Promise<ManualDocumentRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("manual_documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 500);

  if (options?.documentType) {
    query = query.eq("document_type", options.documentType);
  }

  if (options?.propertyRef?.trim()) {
    query = query.ilike("property_ref", `%${options.propertyRef.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data as ManualDocumentRow[]) ?? [];
}

export async function getManualDocument(id: string): Promise<ManualDocumentRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("manual_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ManualDocumentRow | null) ?? null;
}

export async function getDocumentDownloadResponse(
  id: string,
  fileName: string
): Promise<NextResponse> {
  const doc = await getManualDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MANUAL_DOCUMENTS_BUCKET)
    .download(doc.pdf_path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "PDF not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
