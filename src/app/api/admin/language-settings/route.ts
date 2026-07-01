import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";
import {
  getPlatformLanguages,
  sanitizeSiteLanguage,
  type SiteLanguage,
} from "@/lib/platform-language";

const payloadSchema = z.object({
  public_site_language: z.enum(["en", "ar"]),
  dashboard_language: z.enum(["en", "ar"]),
});

export async function GET() {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const languages = await getPlatformLanguages();
  return NextResponse.json(languages);
}

export async function PUT(request: Request) {
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

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const publicLang: SiteLanguage = sanitizeSiteLanguage(parsed.data.public_site_language);
  const dashboardLang: SiteLanguage = sanitizeSiteLanguage(parsed.data.dashboard_language);

  const { error } = await admin.supabase.from("platform_settings").upsert(
    [
      { key: "public_site_language", value: publicLang },
      { key: "dashboard_language", value: dashboardLang },
    ] as never,
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    public_site_language: publicLang,
    dashboard_language: dashboardLang,
  });
}
