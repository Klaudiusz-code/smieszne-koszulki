export const staticRoutes = {
  produkty: "products", sklep: "products", kolekcje: "collections", prezenty: "gifts",
  "wlasny-nadruk": "customPrint", kontakt: "contact", koszyk: "cart",
  zamowienie: "checkout", "resetuj-haslo": "resetPassword", kategoria: "categoriesRedirect",
} as const;

const accountRoutes = { "": "account", adresy: "accountAddresses", pliki: "accountFiles", zamowienia: "accountOrders" } as const;
export type RouteName = "home" | "product" | "category" | "orderPay" | "orderReceived" | "wordpress" | "notFound"
  | typeof staticRoutes[keyof typeof staticRoutes] | typeof accountRoutes[keyof typeof accountRoutes];
export interface StorefrontRoute { name: RouteName; slug?: string; orderId?: string; segments: string[] }

/** Resolve complete paths, never just the first segment. Store namespaces cannot fall through to CMS. */
export function resolveStorefrontRoute(segments: string[], accountEnabled: boolean): StorefrontRoute {
  const route = (name: RouteName, fields: Partial<StorefrontRoute> = {}): StorefrontRoute => ({ name, segments, ...fields });
  if (!segments.length) return route("home");
  if (segments.some((segment) => !segment || segment.includes("/") || segment.includes("\\") || segment === "." || segment === "..")) return route("notFound");
  const [first, second, third] = segments;
  if (segments.length === 1 && Object.hasOwn(staticRoutes, first)) return route(staticRoutes[first as keyof typeof staticRoutes]);
  if (first === "konto") {
    const section = second ?? "";
    if (!accountEnabled || segments.length > 2 || !Object.hasOwn(accountRoutes, section)) return route("notFound");
    return route(accountRoutes[section as keyof typeof accountRoutes]);
  }
  if (first === "produkt" && segments.length === 2) return route("product", { slug: second });
  if (first === "kategoria" && segments.length === 2) return route("category", { slug: second });
  if (first === "zamowienie" && segments.length === 3 && /^[1-9]\d*$/.test(third)) {
    if (second === "order-pay") return route("orderPay", { orderId: third });
    if (second === "order-received") return route("orderReceived", { orderId: third });
  }
  if (Object.hasOwn(staticRoutes, first) || ["produkt", "konto", "api", "feed"].includes(first)) return route("notFound");
  return route("wordpress");
}
