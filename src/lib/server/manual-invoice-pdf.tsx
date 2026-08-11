import React from "react";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { ManualInvoicePdf } from "@/components/pdf/manual-invoice-pdf";
import {
  manualInvoiceFormSchema,
  sanitizeInvoiceFileName,
  type ManualInvoiceFormData,
} from "@/lib/manual-invoice";

export async function renderManualInvoicePdfResponse(body: unknown): Promise<NextResponse> {
  const parsed = manualInvoiceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const data: ManualInvoiceFormData = parsed.data;
  const stream = await pdf(<ManualInvoicePdf data={data} />).toBuffer();
  const fileName = sanitizeInvoiceFileName(data.invoiceNumber);

  return new NextResponse(stream as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
