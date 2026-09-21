import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import {
  DEFAULT_DISCOUNT_PERCENT,
  getPromotionSettings,
  SAUDI_NATIONAL_DAY_DISCOUNT_KEY,
  SAUDI_NATIONAL_DAY_ENABLED_KEY,
  sanitizeDiscountPercent,
} from "@/lib/promotion";

const payloadSchema = z.object({
  enabled: z.boolean(),
  discountPercent: z.coerce.number().min(0).max(100),
});

export async function GET() {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const settings = await getPromotionSettings();
  return NextResponse.json(settings);
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

  const previous = await getPromotionSettings();
  const enabled = parsed.data.enabled;
  const discountPercent = sanitizeDiscountPercent(
    parsed.data.discountPercent,
    DEFAULT_DISCOUNT_PERCENT
  );

  const { error } = await admin.supabase.from("platform_settings").upsert(
    [
      { key: SAUDI_NATIONAL_DAY_ENABLED_KEY, value: enabled ? "true" : "false" },
      { key: SAUDI_NATIONAL_DAY_DISCOUNT_KEY, value: String(discountPercent) },
    ] as never,
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "updated",
    entityType: "platform_settings",
    entityId: "saudi_national_day",
    metadata: {
      previous,
      next: { enabled, discountPercent },
    },
  });

  revalidatePath("/");
  revalidatePath("/properties", "layout");

  return NextResponse.json({ success: true, enabled, discountPercent });
}
