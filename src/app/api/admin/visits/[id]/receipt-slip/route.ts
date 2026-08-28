import { NextResponse } from "next/server";
import { getAdminRouteContext } from "@/lib/admin";
import { loadReceiptSlipVisit, renderReceiptSlipPdfResponse } from "@/lib/server/receipt-slip-pdf";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const visit = await loadReceiptSlipVisit((await context.params).id);
  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return renderReceiptSlipPdfResponse(visit, body);
}
