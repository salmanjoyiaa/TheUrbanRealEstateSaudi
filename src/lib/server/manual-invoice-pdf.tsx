import React from "react";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { ManualInvoicePdf } from "@/components/pdf/manual-invoice-pdf";
import {
  computeInvoiceTotals,
  manualInvoiceFormSchema,
  sanitizeInvoiceFileName,
  type ManualInvoiceFormData,
} from "@/lib/manual-invoice";
import { saveManualDocument } from "@/lib/server/manual-document";
import { reactPdfToBuffer } from "@/lib/server/pdf-buffer";

export async function renderManualInvoicePdfResponse(
  body: unknown,
  createdBy?: string
): Promise<NextResponse> {
  const parsed = manualInvoiceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const data: ManualInvoiceFormData = parsed.data;
  const pdfBuffer = await reactPdfToBuffer(() => pdf(<ManualInvoicePdf data={data} />).toBuffer());
  const fileName = sanitizeInvoiceFileName(data.invoiceNumber);

  if (createdBy) {
    try {
      const totals = computeInvoiceTotals(data);
      await saveManualDocument({
        documentType: "invoice",
        documentNumber: data.invoiceNumber,
        customerName: data.toName,
        customerEmail: data.toEmail,
        customerPhone: data.toPhone,
        customerAddress: data.toAddress,
        documentDate: data.invoiceDate,
        totalAmount: totals.total,
        formData: data,
        pdfBuffer,
        createdBy,
      });
    } catch (error) {
      console.error("[manual-invoice:save]", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to save invoice" },
        { status: 500 }
      );
    }
  }

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
