"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  acceptAllConsent,
  getStoredConsent,
  hasConsentChoice,
  rejectNonEssentialConsent,
  saveConsent,
  type ConsentPreferences,
} from "@/lib/consent";
import { useLocale } from "@/providers/locale-provider";

export function CookieConsent() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    if (!hasConsentChoice()) {
      setVisible(true);
      return;
    }
    const stored = getStoredConsent();
    if (stored) setPreferences(stored);
  }, []);

  const handleAccept = () => {
    acceptAllConsent();
    setVisible(false);
  };

  const handleReject = () => {
    rejectNonEssentialConsent();
    setVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  const detailedParts = t("cookie.detailedMessage").split("{policyLink}");

  return (
    <div
      role="dialog"
      aria-label={t("cookie.dialogLabel")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6"
    >
      <div className="mx-auto max-w-4xl">
        {!showPreferences ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">{t("cookie.preferencesTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {detailedParts[0]}
                <Link href="/cookie-policy" className="font-medium text-primary hover:underline">
                  {t("footer.cookiePolicy")}
                </Link>
                {detailedParts[1]}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                {t("cookie.managePreferences")}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleReject}>
                {t("cookie.rejectNonEssential")}
              </Button>
              <Button size="sm" onClick={handleAccept}>
                {t("cookie.accept")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">{t("cookie.manageTitle")}</p>
            <div className="space-y-3 rounded-lg border border-border p-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1" aria-label={t("cookie.essentialAria")} />
                <span>
                  <span className="block text-sm font-medium text-foreground">{t("cookie.essentialTitle")}</span>
                  <span className="text-xs text-muted-foreground">{t("cookie.essentialDescription")}</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
                  className="mt-1"
                  aria-label={t("cookie.analyticsAria")}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{t("cookie.analyticsTitle")}</span>
                  <span className="text-xs text-muted-foreground">{t("cookie.analyticsDescription")}</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.advertising}
                  onChange={(e) => setPreferences((p) => ({ ...p, advertising: e.target.checked }))}
                  className="mt-1"
                  aria-label={t("cookie.advertisingAria")}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{t("cookie.advertisingTitle")}</span>
                  <span className="text-xs text-muted-foreground">{t("cookie.advertisingDescription")}</span>
                </span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)}>
                {t("common.back")}
              </Button>
              <Button size="sm" onClick={handleSavePreferences}>
                {t("cookie.savePreferences")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
