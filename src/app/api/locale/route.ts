import { NextResponse } from "next/server";
import { z } from "zod";
import { PUBLIC_LOCALE_COOKIE, sanitizeSiteLanguage } from "@/lib/platform-language";

const bodySchema = z.object({
  scope: z.literal("public"),
  locale: z.enum(["en", "ar"]),
});

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const locale = sanitizeSiteLanguage(parsed.data.locale);
  const response = NextResponse.json({ success: true, locale });
  response.cookies.set(PUBLIC_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
