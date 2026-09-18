import { hasCookieConsent } from "@/lib/cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function parsePrice(raw: string | null | undefined): number {
  if (!raw) return 0;
  const stripped = raw.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const clean = stripped.replace(/[^\d,.]*/g, "");
  // WooCommerce używa przecinka jako separatora dziesiętnego (pl_PL)
  const normalized = clean.includes(",") && !clean.includes(".")
    ? clean.replace(",", ".")
    : clean.replace(",", "");
  return parseFloat(normalized) || 0;
}

export function trackViewItem(params: {
  id: string | number;
  name: string;
  price: string | null | undefined;
  sku?: string | null;
  category?: string | null;
}) {
  if (typeof window === "undefined" || !window.gtag || !hasCookieConsent("analytics")) return;
  const price = parsePrice(params.price);
  window.gtag("event", "view_item", {
    currency: "PLN",
    value: price,
    items: [
      {
        item_id: String(params.id),
        item_name: params.name,
        item_sku: params.sku ?? undefined,
        item_category: params.category ?? undefined,
        price,
        quantity: 1,
      },
    ],
  });
}

export function trackBeginCheckout(params: {
  value: string | null | undefined;
  items: { id: number; name: string; quantity: number; price: string }[];
}) {
  if (typeof window === "undefined" || !window.gtag || !hasCookieConsent("analytics")) return;
  window.gtag("event", "begin_checkout", {
    currency: "PLN",
    value: parsePrice(params.value),
    items: params.items.map((item) => ({
      item_id: String(item.id),
      item_name: item.name,
      price: parsePrice(item.price),
      quantity: item.quantity,
    })),
  });
}

export function trackRemoveFromCart(params: {
  id: string | number;
  name: string;
  price: string | null | undefined;
  quantity?: number;
}) {
  if (typeof window === "undefined" || !window.gtag || !hasCookieConsent("analytics")) return;
  const price = parsePrice(params.price);
  window.gtag("event", "remove_from_cart", {
    currency: "PLN",
    value: price,
    items: [
      {
        item_id: String(params.id),
        item_name: params.name,
        price,
        quantity: params.quantity ?? 1,
      },
    ],
  });
}

export function trackAddToCart(params: {
  id: string | number;
  name: string;
  price: string | null | undefined;
  sku?: string | null;
  category?: string | null;
  quantity?: number;
}) {
  if (typeof window === "undefined" || !window.gtag || !hasCookieConsent("analytics")) return;
  const price = parsePrice(params.price);
  window.gtag("event", "add_to_cart", {
    currency: "PLN",
    value: price,
    items: [
      {
        item_id: String(params.id),
        item_name: params.name,
        item_sku: params.sku ?? undefined,
        item_category: params.category ?? undefined,
        price,
        quantity: params.quantity ?? 1,
      },
    ],
  });
}

export function trackPurchase(params: {
  transactionId: string;
  total: string | null | undefined;
  shipping: string | null | undefined;
  items: { name: string; quantity: number }[];
}) {
  if (typeof window === "undefined" || !window.gtag || !hasCookieConsent("analytics")) return;
  window.gtag("event", "purchase", {
    transaction_id: params.transactionId,
    currency: "PLN",
    value: parsePrice(params.total),
    shipping: parsePrice(params.shipping),
    items: params.items.map((item, i) => ({
      item_id: String(i + 1),
      item_name: item.name,
      quantity: item.quantity,
    })),
  });
}
