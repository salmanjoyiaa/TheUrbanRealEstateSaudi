"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/providers/locale-provider";
import { DEFAULT_DISCOUNT_PERCENT } from "@/lib/promotion";

export function SaudiNationalDaySettingsForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(DEFAULT_DISCOUNT_PERCENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/promotion-settings");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || t("admin.promotion.loadFailed"));
        setEnabled(!!json.enabled);
        setDiscountPercent(
          typeof json.discountPercent === "number"
            ? json.discountPercent
            : DEFAULT_DISCOUNT_PERCENT
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("admin.promotion.loadFailed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const previewMessage = useMemo(() => {
    return t("admin.promotion.previewMessage").replace("{percent}", String(discountPercent));
  }, [discountPercent, t]);

  async function handleSave() {
    if (discountPercent < 0 || discountPercent > 100 || Number.isNaN(discountPercent)) {
      toast.error(t("admin.promotion.invalidPercent"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promotion-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, discountPercent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("admin.promotion.saveFailed"));
      setEnabled(!!json.enabled);
      setDiscountPercent(
        typeof json.discountPercent === "number" ? json.discountPercent : discountPercent
      );
      toast.success(t("admin.promotion.saved"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.promotion.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("admin.promotion.loading")}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{t("admin.promotion.title")}</CardTitle>
            <CardDescription className="mt-1.5">{t("admin.promotion.subtitle")}</CardDescription>
          </div>
          <Badge
            variant={enabled ? "default" : "outline"}
            className={enabled ? "bg-emerald-600 hover:bg-emerald-600" : ""}
          >
            {enabled ? t("admin.promotion.statusActive") : t("admin.promotion.statusInactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{t("admin.promotion.campaignStatus")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("admin.promotion.campaignStatusHint")}</p>
          </div>
          <Button
            type="button"
            variant={enabled ? "default" : "outline"}
            className={enabled ? "bg-emerald-600 hover:bg-emerald-700 min-w-[5.5rem]" : "min-w-[5.5rem]"}
            onClick={() => setEnabled((v) => !v)}
            aria-pressed={enabled}
          >
            {enabled ? t("admin.promotion.on") : t("admin.promotion.off")}
          </Button>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label htmlFor="discount-percent">{t("admin.promotion.discountPercent")}</Label>
          <div className="relative">
            <Input
              id="discount-percent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              className="min-h-11 pr-10"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/30 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("admin.promotion.preview")}
          </p>
          <p className="text-sm font-medium text-foreground">{t("admin.promotion.previewTitle")}</p>
          <p className="text-sm text-muted-foreground">{previewMessage}</p>
        </div>

        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? t("admin.promotion.saving") : t("admin.promotion.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
