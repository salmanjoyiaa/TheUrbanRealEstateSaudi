export type ConsentPreferences = {
  analytics: boolean;
  advertising: boolean;
};

export const CONSENT_STORAGE_KEY = "urbansaudi_cookie_consent";
export const CONSENT_EVENT = "urbansaudi-consent-change";

const DEFAULT_PREFERENCES: ConsentPreferences = {
  analytics: false,
  advertising: false,
};

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.advertising !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null;
}

export function saveConsent(preferences: ConsentPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: preferences }));
}

export function acceptAllConsent(): ConsentPreferences {
  const preferences = { analytics: true, advertising: true };
  saveConsent(preferences);
  return preferences;
}

export function rejectNonEssentialConsent(): ConsentPreferences {
  const preferences = { ...DEFAULT_PREFERENCES };
  saveConsent(preferences);
  return preferences;
}

export function subscribeToConsentChange(
  callback: (preferences: ConsentPreferences) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ConsentPreferences>).detail;
    if (detail) callback(detail);
  };

  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
