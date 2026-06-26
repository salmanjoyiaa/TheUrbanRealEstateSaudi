import { NextResponse } from "next/server";
import { visitMessageTemplateSchema } from "@/lib/visit-message-template";
import { getApprovedVisitingAgent } from "@/lib/server/agent-message-template-auth";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { supabase, profileId, error, status } = await getApprovedVisitingAgent();
  if (!profileId) return NextResponse.json({ error }, { status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = visitMessageTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("visit_message_templates")
    .update({
      name: parsed.data.name,
      body: parsed.data.body,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", context.params.id)
    .eq("agent_profile_id", profileId);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { supabase, profileId, error, status } = await getApprovedVisitingAgent();
  if (!profileId) return NextResponse.json({ error }, { status });

  const { error: deleteError } = await supabase
    .from("visit_message_templates")
    .delete()
    .eq("id", context.params.id)
    .eq("agent_profile_id", profileId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
