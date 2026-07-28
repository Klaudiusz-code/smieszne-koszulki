/**
 * Odpowiedzialność głównego layoutu:
 * - definiuje globalne metadane, fonty i strukturę dokumentu,
 * - składa providery stanu dostępne w całej aplikacji,
 * - składa ramę strony z nagłówka, treści i stopki,
 * - osadza modal konta i menedżer zgód,
 * - publikuje globalne dane strukturalne organizacji.
 */
import type { Metadata } from "next";
import { AccountModal } from "@/components/modals/AccountModal/AccountModal";
import { AccountModalProvider } from "@/contexts/account-modal/AccountModalProvider";
import { AuthStateProvider } from "@/contexts/auth-state/AuthStateProvider";
import { StoreProvider } from "@/contexts/StoreProvider";
import { ToastProvider } from "@/contexts/toast/ToastProvider";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SiteFrame } from "@/components/SiteFrame/SiteFrame";
import { CookieConsentManager } from "@/components/CookieConsentManager/CookieConsentManager";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";
import "./globals.css";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  alternates: {
    types: {
      "application/rss+xml": absoluteUrl("/feed"),
    },
  },
  applicationName: SITE_NAME,
  appleWebApp: {
    title: SITE_NAME,
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  keywords: [
    "zabawne koszulki",
    "koszulki z nadrukiem",
    "śmieszne bluzy",
    "kubki z nadrukiem",
    "prezenty z humorem",
    "Zabawne Koszulki",
  ],
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <JsonLd data={organizationSchema()} id="ld-organization" />
        <JsonLd data={websiteSchema()} id="ld-website" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-[#ddb745] selection:text-black">
        <AuthStateProvider>
          <AccountModalProvider>
            <StoreProvider>
              <ToastProvider>
                <SiteFrame footer={<SiteFooter />}>
                  {children}
                </SiteFrame>
                <CookieConsentManager adsenseClientId={adsenseClientId} />
              </ToastProvider>
            </StoreProvider>
            <AccountModal />
          </AccountModalProvider>
        </AuthStateProvider>
      </body>
    </html>
  );
}
