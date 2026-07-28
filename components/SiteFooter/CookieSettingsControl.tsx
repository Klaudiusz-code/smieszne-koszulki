/** Łączy przycisk stopki z mechanizmem otwierania ustawień cookies. */
"use client";

import { CookieSettingsButton } from "@/components/buttons/CookieSettingsButton";
import { openCookieSettings } from "@/lib/cookie-consent";

export function CookieSettingsControl() {
  return <CookieSettingsButton onClick={openCookieSettings} />;
}
