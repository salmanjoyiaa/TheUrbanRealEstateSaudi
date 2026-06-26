import { NextResponse } from "next/server";
import { visitMessageTemplateSchema } from "@/lib/visit-message-template";
import { getApprovedVisitingAgent } from "@/lib/server/agent-message-template-auth";
import type { VisitMessageTemplate } from "@/lib/visit-message-template";

export async function GET() {
  const { supabase, profileId, error, status } = await getApprovedVisitingAgent();
  if (!profileId) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = (await supabase
    .from("visit_message_templates")
    .select("*")
    .eq("agent_profile_id", profileId)
    .order("name", { ascending: true })) as {
    data: VisitMessageTemplate[] | null;
    error: { message: string; code?: string } | null;
  };

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
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

  const { data, error: insertError } = (await supabase
    .from("visit_message_templates")
    .insert({
      agent_profile_id: profileId,
      name: parsed.data.name,
      body: parsed.data.body,
    } as never)
    .select("*")
    .single()) as {
    data: VisitMessageTemplate | null;
    error: { message: string; code?: string } | null;
  };

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
