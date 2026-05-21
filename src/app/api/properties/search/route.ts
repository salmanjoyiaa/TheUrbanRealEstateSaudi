import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q")?.trim() ?? "").replace(/[%_]/g, "");
  if (q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  try {
    const supabase = createApiClient();
    const pattern = `%${q}%`;

    const { data, error } = await supabase
      .from("properties")
      .select("id, property_ref, title, status, city, district, images")
      .not("property_ref", "is", null)
      .ilike("property_ref", pattern)
      .order("property_ref", { ascending: true })
      .limit(8);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
