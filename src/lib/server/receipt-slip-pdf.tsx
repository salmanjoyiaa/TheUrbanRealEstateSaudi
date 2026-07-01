import React from "react";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReceiptSlipPdf } from "@/components/pdf/receipt-slip-pdf";
import {
  canGenerateReceiptSlip,
  receiptSlipFormSchema,
  sanitizeReceiptSlipFileName,
} from "@/lib/receipt-slip";

const VISIT_SELECT = `
  id, visitor_name, visitor_phone, visit_date, status, visiting_agent_id, notification_sent_at,
  visiting_agent:visiting_agent_id(id, full_name),
  properties:property_id (title, property_ref)
`;

export type ReceiptSlipVisitRow = {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visit_date: string;
  status: string;
  visiting_agent_id: string | null;
  notification_sent_at: string | null;
  visiting_agent: { id: string; full_name: string } | null;
  properties: { title: string; property_ref: string | null } | null;
};

export async function loadReceiptSlipVisit(visitId: string): Promise<ReceiptSlipVisitRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("visit_requests")
    .select(VISIT_SELECT)
    .eq("id", visitId)
    .maybeSingle();

  return (data as ReceiptSlipVisitRow | null) ?? null;
}

export async function renderReceiptSlipPdfResponse(
  visit: ReceiptSlipVisitRow,
  body: unknown
): Promise<NextResponse> {
  const parsed = receiptSlipFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  if (!canGenerateReceiptSlip(visit)) {
    return NextResponse.json(
      { error: "Receipt slip is only available for confirmed, notified visits with an assigned agent" },
      { status: 403 }
    );
  }

  const stream = await pdf(<ReceiptSlipPdf data={parsed.data} />).toBuffer();
  const fileName = sanitizeReceiptSlipFileName(
    visit.properties?.property_ref,
    parsed.data.date || visit.visit_date
  );

  return new NextResponse(stream as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
