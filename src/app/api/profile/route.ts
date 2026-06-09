import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";

const patchSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\+[0-9]{10,15}$/, "Phone must be in format +966XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().url().max(1000).optional().nullable(),
});

export async function GET() {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = (await supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at, email")
    .eq("id", user.id)
    .single()) as {
    data: {
      id: string;
      full_name: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      created_at: string;
      email: string;
    } | null;
    error: { message: string } | null;
  };

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...profile,
    email: user.email ?? profile.email,
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Invalid payload";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (parsed.data.full_name !== undefined) {
    updates.full_name = parsed.data.full_name.trim();
  }
  if (parsed.data.phone !== undefined) {
    updates.phone = parsed.data.phone.trim() || null;
  }
  if (parsed.data.avatar_url !== undefined) {
    updates.avatar_url = parsed.data.avatar_url;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: profile, error } = (await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", user.id)
    .select("id, full_name, phone, avatar_url, role, created_at, email")
    .single()) as {
    data: {
      id: string;
      full_name: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      created_at: string;
      email: string;
    } | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...profile,
    email: user.email,
  });
}
