export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_STORAGE_KEY = `zabawnekoszulki:cookie-consent:v${COOKIE_CONSENT_VERSION}`;
export const COOKIE_CONSENT_CHANGE_EVENT = "zabawnekoszulki:cookie-consent-change";
export const COOKIE_SETTINGS_EVENT = "zabawnekoszulki:open-cookie-settings";

export type OptionalCookieCategory = "analytics" | "marketing";

export interface CookieConsent {
  version: typeof COOKIE_CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface CookieConsentDraft {
  analytics: boolean;
  marketing: boolean;
}

let memoryConsent: CookieConsent | null = null;

function normalizeConsent(value: unknown): CookieConsent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CookieConsent>;
  if (candidate.version !== COOKIE_CONSENT_VERSION) {
    return null;
  }

  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: Boolean(candidate.analytics),
    marketing: Boolean(candidate.marketing),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return memoryConsent;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    const parsed = stored ? normalizeConsent(JSON.parse(stored)) : null;
    memoryConsent = parsed;
    return parsed;
  } catch {
    return memoryConsent;
  }
}

export function saveCookieConsent(draft: CookieConsentDraft): CookieConsent {
  const consent: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: draft.analytics,
    marketing: draft.marketing,
    updatedAt: new Date().toISOString(),
  };

  memoryConsent = consent;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // Keep the in-memory consent when storage is unavailable.
    }

    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: consent }));
  }

  return consent;
}

export function hasCookieConsent(category: OptionalCookieCategory): boolean {
  return Boolean(readCookieConsent()?.[category]);
}

export function openCookieSettings() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
