import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";
import { cacheDel } from "@/lib/redis";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { visitCancelled, visitRescheduled } from "@/lib/whatsapp-templates";
import { visitCancelledCustomerEmail } from "@/lib/email-templates";
import { formatMessageDate, formatMessageTime } from "@/lib/format";

const statusUpdateSchema = z.object({
  visiting_status: z.enum([
    "view",
    "contact_done",
    "customer_confirmed",
    "customer_arrived",
    "visit_done",
    "customer_remarks",
    "deal_pending",
    "deal_fail",
    "commission_got",
    "deal_close",
  ]),
  customer_remarks: z.string().optional().nullable(),
  commission_received_amount: z.coerce.number().positive("Commission amount must be greater than zero").optional(),
});

const cancelSchema = z.object({
  action: z.literal("cancel"),
  cancellation_reason: z.string().min(3, "Cancellation reason is required").max(2000),
});

const rescheduleSchema = z.object({
  action: z.literal("reschedule"),
  reschedule_reason: z.string().min(3, "Reschedule reason is required").max(2000),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  visit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be HH:MM"),
});

const payloadSchema = z.union([
  cancelSchema,
  rescheduleSchema,
  statusUpdateSchema,
]);

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return (hours * 60) + minutes;
}

function normalizeTime(time: string) {
  return time.length >= 8 ? time.slice(0, 8) : `${time.slice(0, 5)}:00`;
}

function revalidateAgentSurfaces() {
  revalidatePath("/agent", "page");
  revalidatePath("/agent/assignments", "page");
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const supabase = await createRouteClient();
  const adminDb = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { data: currentVisit } = (await supabase
    .from("visit_requests")
    .select(`
      id, property_id, visitor_name, visitor_email, visitor_phone,
      visiting_agent_id, status, visit_date, visit_time,
      properties:property_id (title)
    `)
    .eq("id", context.params.id)
    .eq("visiting_agent_id", user.id)
    .maybeSingle()) as {
      data: {
        id: string;
        property_id: string;
        visitor_name: string;
        visitor_email: string;
        visitor_phone: string;
        visiting_agent_id: string;
        status: string;
        visit_date: string;
        visit_time: string;
        properties: { title: string } | null;
      } | null;
    };

  if (!currentVisit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  if (currentVisit.status === "cancelled") {
    return NextResponse.json({ error: "This visit is already cancelled" }, { status: 400 });
  }

  const propertyTitle = currentVisit.properties?.title || "Property";

  if ("action" in parsed.data && parsed.data.action === "cancel") {
    const { cancellation_reason } = parsed.data;
    const oldDate = currentVisit.visit_date;
    const oldTime = String(currentVisit.visit_time).slice(0, 5);

    const { error } = await adminDb
      .from("visit_requests")
      .update({
        status: "cancelled",
        cancellation_reason,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
      } as never)
      .eq("id", context.params.id)
      .eq("visiting_agent_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await adminDb
      .from("blocked_slots")
      .delete()
      .eq("property_id", currentVisit.property_id)
      .eq("date", oldDate)
      .eq("time", oldTime);

    await cacheDel(`slots:${currentVisit.property_id}:${oldDate}`);

    await supabase.from("visit_comments").insert({
      visit_id: context.params.id,
      author_id: user.id,
      content: `Visit cancelled by visiting agent. Reason: ${cancellation_reason}`,
    } as never);

    const templateParams = {
      visitorName: currentVisit.visitor_name,
      propertyTitle,
      visitDate: formatMessageDate(oldDate),
      visitTime: formatMessageTime(currentVisit.visit_time),
    };

    await Promise.allSettled([
      sendWhatsApp(currentVisit.visitor_phone, visitCancelled(templateParams), context.params.id),
      currentVisit.visitor_email
        ? sendEmail({
            to: currentVisit.visitor_email,
            ...visitCancelledCustomerEmail(templateParams),
            visitId: context.params.id,
          })
        : Promise.resolve(),
    ]);

    revalidateAgentSurfaces();
    return NextResponse.json({ success: true });
  }

  if ("action" in parsed.data && parsed.data.action === "reschedule") {
    const { reschedule_reason, visit_date: newDate, visit_time: rawTime } = parsed.data;
    const newTime = rawTime.slice(0, 5);
    const newTimeFull = normalizeTime(rawTime);
    const oldDate = currentVisit.visit_date;
    const oldTime = String(currentVisit.visit_time).slice(0, 5);
    const nowDate = new Date().toISOString().slice(0, 10);

    if (newDate < nowDate) {
      return NextResponse.json({ error: "Reschedule date must be today or a future date" }, { status: 400 });
    }

    if (newDate === oldDate && newTime === oldTime) {
      return NextResponse.json({ error: "Please select a different date or time" }, { status: 400 });
    }

    const weekday = new Date(`${newDate}T00:00:00`).getDay();
    const { data: hoursData } = (await adminDb
      .from("property_visit_hours")
      .select("is_open, start_time, end_time")
      .eq("property_id", currentVisit.property_id)
      .eq("weekday", weekday)
      .maybeSingle()) as {
        data: { is_open: boolean; start_time: string; end_time: string } | null;
      };

    if (!hoursData || !hoursData.is_open) {
      return NextResponse.json({ error: "Selected date is closed for this property" }, { status: 409 });
    }

    const requestMinutes = timeToMinutes(newTime);
    const startMinutes = timeToMinutes(String(hoursData.start_time));
    const endMinutes = timeToMinutes(String(hoursData.end_time));
    if (requestMinutes < startMinutes || requestMinutes >= endMinutes) {
      return NextResponse.json({ error: "Selected time is outside property visit hours" }, { status: 409 });
    }

    const { count: existingVisitCount } = await adminDb
      .from("visit_requests")
      .select("id", { count: "exact", head: true })
      .eq("property_id", currentVisit.property_id)
      .eq("visit_date", newDate)
      .eq("visit_time", newTimeFull)
      .in("status", ["pending", "assigned", "confirmed"])
      .neq("id", context.params.id);

    if ((existingVisitCount || 0) > 0) {
      return NextResponse.json({ error: "Selected slot is already booked" }, { status: 409 });
    }

    const { count: blockedCount } = await adminDb
      .from("blocked_slots")
      .select("id", { count: "exact", head: true })
      .eq("property_id", currentVisit.property_id)
      .eq("date", newDate)
      .eq("time", newTime);

    if ((blockedCount || 0) > 0) {
      return NextResponse.json({ error: "Selected slot is currently blocked" }, { status: 409 });
    }

    const { error } = await adminDb
      .from("visit_requests")
      .update({
        visit_date: newDate,
        visit_time: newTimeFull,
        reschedule_reason,
        reschedule_date: newDate,
        reschedule_time: newTimeFull,
      } as never)
      .eq("id", context.params.id)
      .eq("visiting_agent_id", user.id);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Selected slot was just taken" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (oldDate !== newDate || oldTime !== newTime) {
      await adminDb
        .from("blocked_slots")
        .delete()
        .eq("property_id", currentVisit.property_id)
        .eq("date", oldDate)
        .eq("time", oldTime);
    }

    await cacheDel(`slots:${currentVisit.property_id}:${oldDate}`);
    await cacheDel(`slots:${currentVisit.property_id}:${newDate}`);

    await supabase.from("visit_comments").insert({
      visit_id: context.params.id,
      author_id: user.id,
      content: `Visit rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}. Reason: ${reschedule_reason}`,
    } as never);

    const templateParams = {
      visitorName: currentVisit.visitor_name,
      propertyTitle,
      visitDate: formatMessageDate(newDate),
      visitTime: formatMessageTime(newTimeFull),
    };

    await sendWhatsApp(currentVisit.visitor_phone, visitRescheduled(templateParams), context.params.id);

    revalidateAgentSurfaces();
    return NextResponse.json({ success: true });
  }

  const statusData = parsed.data as z.infer<typeof statusUpdateSchema>;

  if (statusData.visiting_status === "commission_got" && !statusData.commission_received_amount) {
    return NextResponse.json(
      { error: "Commission amount is required before marking commission received" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: any = {
    visiting_status: statusData.visiting_status,
    ...(statusData.visiting_status === "visit_done" ? { status: "completed" } : {}),
    ...(statusData.customer_remarks !== undefined ? { customer_remarks: statusData.customer_remarks } : {}),
    ...(statusData.visiting_status === "commission_got"
      ? {
          commission_received_amount: statusData.commission_received_amount,
          commission_received_at: new Date().toISOString(),
        }
      : {}),
  };

  const { error } = await supabase
    .from("visit_requests")
    .update(updatePayload as never)
    .eq("id", context.params.id)
    .eq("visiting_agent_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateAgentSurfaces();
  return NextResponse.json({ success: true });
}
