"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getStoredConsent, subscribeToConsentChange } from "@/lib/consent";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "";

export function AdSenseScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return;

    const checkConsent = () => {
      const consent = getStoredConsent();
      setEnabled(consent?.advertising === true);
    };

    checkConsent();
    return subscribeToConsentChange((prefs) => {
      setEnabled(prefs.advertising === true);
    });
  }, []);

  if (!ADSENSE_CLIENT_ID || !enabled) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
