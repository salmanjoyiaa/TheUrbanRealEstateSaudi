import React from "react";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { ReceiptSlipPdf } from "@/components/pdf/receipt-slip-pdf";
import {
  manualReceiptFormSchema,
  sanitizeManualReceiptFileName,
  toReceiptSlipPdfData,
  type ManualReceiptFormData,
} from "@/lib/manual-receipt";
import { saveManualDocument } from "@/lib/server/manual-document";
import { reactPdfToBuffer } from "@/lib/server/pdf-buffer";

export async function renderManualReceiptPdfResponse(
  body: unknown,
  createdBy?: string
): Promise<NextResponse> {
  const parsed = manualReceiptFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const data: ManualReceiptFormData = parsed.data;
  const slipData = toReceiptSlipPdfData(data);
  const pdfBuffer = await reactPdfToBuffer(() => pdf(<ReceiptSlipPdf data={slipData} />).toBuffer());
  const fileName = sanitizeManualReceiptFileName(
    data.receiptNumber,
    data.propertyRef,
    data.date
  );

  if (createdBy) {
    try {
      await saveManualDocument({
        documentType: "receipt",
        documentNumber: data.receiptNumber,
        customerName: data.payeeName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        propertyId: data.propertyId,
        propertyRef: data.propertyRef,
        propertyName: data.propertyName,
        documentDate: data.date,
        totalAmount: data.amount ?? null,
        formData: data,
        pdfBuffer,
        createdBy,
      });
    } catch (error) {
      console.error("[manual-receipt:save]", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to save receipt" },
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
