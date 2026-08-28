import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { loadReceiptSlipVisit, renderReceiptSlipPdfResponse } from "@/lib/server/receipt-slip-pdf";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visit = await loadReceiptSlipVisit((await context.params).id);
  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  if (visit.visiting_agent_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return renderReceiptSlipPdfResponse(visit, body);
}
