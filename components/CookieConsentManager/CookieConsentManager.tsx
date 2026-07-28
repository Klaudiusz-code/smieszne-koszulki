/**
 * Odpowiedzialność komponentu:
 * - wyświetla baner i panel ustawień zgód cookies,
 * - zapisuje wybory użytkownika oraz pozwala je później zmienić,
 * - uruchamia opcjonalne integracje dopiero po uzyskaniu odpowiedniej zgody.
 */
"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons/Button";
import { Switch } from "@/components/controls/Switch";
import { CookieIcon } from "@/components/icons/CookieIcon";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_SETTINGS_EVENT,
  type CookieConsent,
  type CookieConsentDraft,
  readCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

const GOOGLE_TAG_ID = "GT-5MR4S658";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const emptyDraft: CookieConsentDraft = {
  analytics: false,
  marketing: false,
};

const defaultDraft: CookieConsentDraft = {
  analytics: true,
  marketing: true,
};

function draftFromConsent(consent: CookieConsent | null): CookieConsentDraft {
  if (!consent) return defaultDraft;
  return { analytics: consent.analytics, marketing: consent.marketing };
}

function cookieDomainCandidates() {
  if (typeof window === "undefined") return [undefined];

  const host = window.location.hostname;
  const parts = host.split(".").filter(Boolean);
  const candidates = [undefined, host, `.${host}`];
  if (parts.length > 2) candidates.push(`.${parts.slice(-2).join(".")}`);
  return [...new Set(candidates)];
}

function expireCookie(name: string) {
  for (const domain of cookieDomainCandidates()) {
    const domainPart = domain ? `; domain=${domain}` : "";
    document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`;
  }
}

function clearGoogleCookies(consent: CookieConsent) {
  const names = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter(Boolean);

  for (const name of names) {
    if (!consent.analytics && (name === "_ga" || name === "_gid" || name.startsWith("_ga_") || name.startsWith("_gat"))) {
      expireCookie(name);
    }
    if (!consent.marketing && (name.startsWith("_gcl_") || name === "IDE" || name === "NID")) {
      expireCookie(name);
    }
  }
}

function updateGoogleConsent(consent: CookieConsent) {
  window.gtag?.("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

/* ─── Consent row ────────────────────────────────────────────── */

function ConsentRow({
  title,
  description,
  checked,
  required,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  required?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${required ? "border-[#E8DDD6] bg-cd-cream/50" : "border-[#e7e5e4] bg-white"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-cd-brown">{title}</span>
          {required && (
            <span className="rounded-full bg-cd-brown/10 px-2 py-[1px] text-[10px] font-medium text-cd-brown/60">
              Wymagane
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-[18px] text-cd-brown/50">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={required}
        label={title}
        size="sm"
        onChange={(nextChecked) => onChange?.(nextChecked)}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export function CookieConsentManager({ adsenseClientId }: { adsenseClientId?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [draft, setDraft] = useState<CookieConsentDraft>(emptyDraft);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    function syncConsent() {
      const next = readCookieConsent();
      setConsent(next);
      setDraft(draftFromConsent(next));
    }

    function openSettings() {
      const current = readCookieConsent();
      setConsent(current);
      setDraft(draftFromConsent(current));
      setIsSettingsOpen(true);
      setIsPanelOpen(true);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key?.startsWith("zabawnekoszulki:cookie-consent")) syncConsent();
    }

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    window.addEventListener("storage", handleStorage);

    window.queueMicrotask(() => {
      const initial = readCookieConsent();
      setConsent(initial);
      setDraft(draftFromConsent(initial));
      setIsPanelOpen(!initial);
      setHydrated(true);
    });

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !consent) return;
    updateGoogleConsent(consent);
    clearGoogleCookies(consent);
  }, [consent, hydrated]);

  function closeWith(nextDraft: CookieConsentDraft) {
    const next = saveCookieConsent(nextDraft);
    setConsent(next);
    setDraft(draftFromConsent(next));
    setIsPanelOpen(false);
    setIsSettingsOpen(false);
  }

  const loadAnalytics = Boolean(consent?.analytics);
  const loadMarketing = Boolean(consent?.marketing && adsenseClientId);

  return (
    <>
      {loadAnalytics ? (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'granted',
              ad_storage: '${consent?.marketing ? "granted" : "denied"}',
              ad_user_data: '${consent?.marketing ? "granted" : "denied"}',
              ad_personalization: '${consent?.marketing ? "granted" : "denied"}'
            });
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}', { anonymize_ip: true });
          `}</Script>
        </>
      ) : null}

      {loadMarketing ? (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      ) : null}

      {hydrated && isPanelOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-3 sm:px-5 sm:pb-5 animate-[slideUp_.3s_ease-out]" role="dialog" aria-modal="false" aria-label="Ustawienia plików cookies">
          <div className="mx-auto max-w-[960px] rounded-2xl border border-[#E8DDD6] bg-white text-cd-brown shadow-[0_24px_64px_rgba(28,28,28,0.18)]">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 sm:px-6">
              <div className="flex items-center gap-2">
                <CookieIcon className="h-5 w-5 text-cd-brown/60" />
                <p className="text-[15px] font-semibold text-cd-brown">Pliki cookies</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-[20px] text-cd-brown/60">
                Używamy plików cookies niezbędnych do działania strony. Analitykę i marketing włączamy dopiero po Twojej zgodzie.
              </p>
              <div className="mt-2 flex gap-4 text-[12px]">
                <Link href="/polityka-prywatnosci" className="font-medium text-cd-brown/50 underline underline-offset-3 transition-colors hover:text-cd-brown">
                  Polityka prywatności
                </Link>
                <Link href="/regulamin" className="font-medium text-cd-brown/50 underline underline-offset-3 transition-colors hover:text-cd-brown">
                  Regulamin
                </Link>
              </div>
            </div>

            {/* Settings panel */}
            {isSettingsOpen && (
              <div className="border-t border-[#EFE5DE] px-5 py-4 sm:px-6">
                <div className="grid gap-3.5 sm:grid-cols-3">
                  <ConsentRow
                    title="Niezbędne"
                    description="Wymagane do działania strony, koszyka, zamówień i bezpieczeństwa."
                    checked
                    required
                  />
                  <ConsentRow
                    title="Analityczne"
                    description="Pomagają mierzyć ruch i zdarzenia, np. wyświetlenia produktów."
                    checked={draft.analytics}
                    onChange={(analytics) => setDraft((c) => ({ ...c, analytics }))}
                  />
                  <ConsentRow
                    title="Marketingowe"
                    description="Obsługa i pomiar reklam, jeśli są włączone narzędzia Google."
                    checked={draft.marketing}
                    onChange={(marketing) => setDraft((c) => ({ ...c, marketing }))}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={`flex flex-col gap-2 border-t border-[#EFE5DE] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6 ${isSettingsOpen ? "" : ""}`}>
              {isSettingsOpen ? (
                <Button variant="primary" elevated onClick={() => closeWith(draft)}>Zapisz wybór</Button>
              ) : (
                <>
                  <Button onClick={() => closeWith(emptyDraft)}>Odrzucam</Button>
                  <Button variant="primary" elevated onClick={() => closeWith(defaultDraft)}>Akceptuję</Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
