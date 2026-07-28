import type { Metadata } from "next";

export const SITE_NAME = "Zabawne Koszulki";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zabawnekoszulki.pl";
export const DEFAULT_SEO_DESCRIPTION =
  "Koszulki, bluzy, kubki i gadżety z nadrukami, które poprawiają humor i świetnie sprawdzają się na prezent.";
export const ORGANIZATION_LOGO = "/logo-koszulki.svg";
export const ORGANIZATION_EMAIL = "kontakt@smiesznekoszulki.pl";
export const ORGANIZATION_PHONE = "";
export const ORGANIZATION_SAME_AS: string[] = [];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSeoDescription(value: string | null | undefined, fallback = DEFAULT_SEO_DESCRIPTION) {
  const text = stripHtml(value || fallback);

  if (text.length <= 155) {
    return text;
  }

  return `${text.slice(0, 152).trim()}...`;
}

export function createSeoMetadata({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "pl_PL",
      type: "website",
      images: imageUrl ? [
        {
          url: imageUrl,
          alt: SITE_NAME,
        },
      ] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

const ORGANIZATION_ID = `${SITE_URL.replace(/\/$/, "")}/#organization`;
const WEBSITE_ID = `${SITE_URL.replace(/\/$/, "")}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(ORGANIZATION_LOGO),
    },
    email: ORGANIZATION_EMAIL,
    ...(ORGANIZATION_PHONE ? { telephone: ORGANIZATION_PHONE } : {}),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ORGANIZATION_EMAIL,
        ...(ORGANIZATION_PHONE ? { telephone: ORGANIZATION_PHONE } : {}),
        areaServed: "PL",
        availableLanguage: ["Polish"],
      },
    ],
    sameAs: ORGANIZATION_SAME_AS,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
    inLanguage: "pl-PL",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/produkty")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function itemListSchema(
  items: { name: string; url: string; image?: string | null }[],
  listName?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(listName ? { name: listName } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

interface ArticleSchemaInput {
  url: string;
  headline: string;
  description?: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
}

export function articleSchema({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      "@type": authorName ? "Person" : "Organization",
      name: authorName || SITE_NAME,
    },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "pl-PL",
  };
}

export function webPageSchema({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name,
    ...(description ? { description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "pl-PL",
  };
}

export function merchantReturnPolicySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MerchantReturnPolicy",
    "@id": `${SITE_URL.replace(/\/$/, "")}/zwroty#policy`,
    name: "Polityka zwrotów",
    url: absoluteUrl("/zwroty"),
    inStoreReturnsOffered: false,
    applicableCountry: "PL",
    returnPolicyCountry: "PL",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    refundType: "https://schema.org/FullRefund",
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
