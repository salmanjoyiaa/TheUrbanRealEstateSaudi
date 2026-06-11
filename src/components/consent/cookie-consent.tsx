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

export function CookieConsent() {
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

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6"
    >
      <div className="mx-auto max-w-4xl">
        {!showPreferences ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">Cookie preferences</p>
              <p className="text-sm text-muted-foreground">
                We use essential cookies for login and site functionality. With your consent, we may also use analytics
                and advertising cookies. See our{" "}
                <Link href="/cookie-policy" className="font-medium text-primary hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                Manage Preferences
              </Button>
              <Button variant="secondary" size="sm" onClick={handleReject}>
                Reject Non-Essential
              </Button>
              <Button size="sm" onClick={handleAccept}>
                Accept
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Manage cookie preferences</p>
            <div className="space-y-3 rounded-lg border border-border p-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1" aria-label="Essential cookies always enabled" />
                <span>
                  <span className="block text-sm font-medium text-foreground">Essential cookies</span>
                  <span className="text-xs text-muted-foreground">Required for login and core site features. Always on.</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
                  className="mt-1"
                  aria-label="Analytics cookies"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">Analytics cookies</span>
                  <span className="text-xs text-muted-foreground">Help us understand how visitors use the site (e.g. Google Analytics).</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.advertising}
                  onChange={(e) => setPreferences((p) => ({ ...p, advertising: e.target.checked }))}
                  className="mt-1"
                  aria-label="Advertising cookies"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">Advertising cookies</span>
                  <span className="text-xs text-muted-foreground">Used to show relevant ads if advertising is enabled.</span>
                </span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)}>
                Back
              </Button>
              <Button size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
