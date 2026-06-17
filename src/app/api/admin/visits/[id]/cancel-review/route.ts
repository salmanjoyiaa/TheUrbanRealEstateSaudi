import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { cacheDel } from "@/lib/redis";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { visitCancelled } from "@/lib/whatsapp-templates";
import { visitCancelledCustomerEmail } from "@/lib/email-templates";
import { formatMessageDate, formatMessageTime } from "@/lib/format";

const payloadSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional().nullable(),
});

type CancelRequestVisit = {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: string;
  cancellation_reason: string | null;
  cancellation_requested_at: string | null;
  cancellation_reviewed_at: string | null;
  properties: { title: string } | null;
};

function revalidateVisitSurfaces() {
  revalidatePath("/admin/visits", "page");
  revalidatePath("/agent", "page");
  revalidatePath("/agent/assignments", "page");
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  const { data: visit } = (await adminDb
    .from("visit_requests")
    .select(`
      id, property_id, visitor_name, visitor_email, visitor_phone,
      visit_date, visit_time, status, cancellation_reason,
      cancellation_requested_at, cancellation_reviewed_at,
      properties:property_id (title)
    `)
    .eq("id", context.params.id)
    .maybeSingle()) as { data: CancelRequestVisit | null };

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  if (!visit.cancellation_requested_at || visit.cancellation_reviewed_at) {
    return NextResponse.json({ error: "No pending cancel request for this visit" }, { status: 404 });
  }

  if (visit.status === "cancelled") {
    return NextResponse.json({ error: "Visit is already cancelled" }, { status: 409 });
  }

  const propertyTitle = visit.properties?.title || "Property";
  const now = new Date().toISOString();
  const oldDate = visit.visit_date;
  const oldTime = String(visit.visit_time).slice(0, 5);

  if (parsed.data.action === "approve") {
    const { error } = await adminDb
      .from("visit_requests")
      .update({
        status: "cancelled",
        cancelled_by: admin.profile.id,
        cancelled_at: now,
        cancellation_reviewed_by: admin.profile.id,
        cancellation_reviewed_at: now,
        cancellation_review_note: parsed.data.note || null,
      } as never)
      .eq("id", visit.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await adminDb
      .from("blocked_slots")
      .delete()
      .eq("property_id", visit.property_id)
      .eq("date", oldDate)
      .eq("time", oldTime);

    await cacheDel(`slots:${visit.property_id}:${oldDate}`);

    const templateParams = {
      visitorName: visit.visitor_name,
      propertyTitle,
      visitDate: formatMessageDate(oldDate),
      visitTime: formatMessageTime(visit.visit_time),
    };

    await Promise.allSettled([
      sendWhatsApp(visit.visitor_phone, visitCancelled(templateParams), visit.id),
      visit.visitor_email
        ? sendEmail({
            to: visit.visitor_email,
            ...visitCancelledCustomerEmail(templateParams),
            visitId: visit.id,
          })
        : Promise.resolve(),
    ]);

    await adminDb.from("visit_comments").insert({
      visit_id: visit.id,
      author_id: admin.profile.id,
      content: `Cancel request approved by admin.${parsed.data.note ? ` Note: ${parsed.data.note}` : ""}`,
    } as never);
  } else {
    const { error } = await adminDb
      .from("visit_requests")
      .update({
        cancellation_reason: null,
        cancellation_requested_by: null,
        cancellation_requested_at: null,
        cancellation_reviewed_by: admin.profile.id,
        cancellation_reviewed_at: now,
        cancellation_review_note: parsed.data.note || null,
      } as never)
      .eq("id", visit.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await adminDb.from("visit_comments").insert({
      visit_id: visit.id,
      author_id: admin.profile.id,
      content: `Cancel request rejected by admin.${parsed.data.note ? ` Reason: ${parsed.data.note}` : ""}`,
    } as never);
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: parsed.data.action === "approve" ? "visit_cancel_approved" : "visit_cancel_rejected",
    entityType: "visit_requests",
    entityId: visit.id,
    metadata: { note: parsed.data.note || null },
  });

  revalidateVisitSurfaces();
  return NextResponse.json({ success: true });
}
