import { NextResponse } from "next/server";
import { getAdminRouteContext } from "@/lib/admin";
import { renderManualReceiptPdfResponse } from "@/lib/server/manual-receipt-pdf";

export async function POST(request: Request) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return renderManualReceiptPdfResponse(body, admin.profile.id);
}
