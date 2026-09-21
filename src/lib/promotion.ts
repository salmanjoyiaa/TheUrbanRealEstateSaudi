import { createAdminClient } from "@/lib/supabase/admin";

export const SAUDI_NATIONAL_DAY_ENABLED_KEY = "saudi_national_day_enabled";
export const SAUDI_NATIONAL_DAY_DISCOUNT_KEY = "saudi_national_day_discount_percent";
export const DEFAULT_DISCOUNT_PERCENT = 10;

export type PromotionSettings = {
  enabled: boolean;
  discountPercent: number;
};

export type ActivePromotion =
  | { enabled: true; discountPercent: number }
  | { enabled: false; discountPercent?: number };

export type OfficeFeeDiscountResult = {
  originalFee: number;
  discountPercent: number;
  discountAmount: number;
  finalFee: number;
};

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function sanitizeDiscountPercent(value: unknown, fallback = DEFAULT_DISCOUNT_PERCENT): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) return fallback;
  return roundMoney(n);
}

export function parseOfficeFeeAmount(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null;
  const cleaned = raw.trim().replace(/,/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return roundMoney(n);
}

export function calculateOfficeFeeDiscount(params: {
  officeFee: number;
  discountPercent: number;
}): OfficeFeeDiscountResult {
  const originalFee = Math.max(0, roundMoney(params.officeFee));
  const discountPercent = sanitizeDiscountPercent(params.discountPercent, 0);
  const discountAmount = roundMoney((originalFee * discountPercent) / 100);
  const finalFee = Math.max(0, roundMoney(originalFee - discountAmount));
  return { originalFee, discountPercent, discountAmount, finalFee };
}

async function getPlatformSetting(key: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = (await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()) as { data: { value: string } | null };
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function getPromotionSettings(): Promise<PromotionSettings> {
  const [enabledRaw, percentRaw] = await Promise.all([
    getPlatformSetting(SAUDI_NATIONAL_DAY_ENABLED_KEY),
    getPlatformSetting(SAUDI_NATIONAL_DAY_DISCOUNT_KEY),
  ]);

  return {
    enabled: enabledRaw === "true",
    discountPercent: sanitizeDiscountPercent(percentRaw, DEFAULT_DISCOUNT_PERCENT),
  };
}

/** Fail-safe: only returns enabled:true when backend confirms a valid active promo. */
export async function getActivePromotion(): Promise<ActivePromotion> {
  try {
    const settings = await getPromotionSettings();
    if (!settings.enabled) {
      return { enabled: false, discountPercent: settings.discountPercent };
    }
    if (
      !Number.isFinite(settings.discountPercent) ||
      settings.discountPercent < 0 ||
      settings.discountPercent > 100
    ) {
      return { enabled: false };
    }
    return { enabled: true, discountPercent: settings.discountPercent };
  } catch {
    return { enabled: false };
  }
}
