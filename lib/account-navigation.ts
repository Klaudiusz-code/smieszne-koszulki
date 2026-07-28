import type { AccountSection } from "@/types/account";

export const ACCOUNT_NAV_ITEMS = [
  { section: "details", href: "/konto", label: "Szczegóły konta" },
  { section: "orders", href: "/konto/zamowienia", label: "Zamówienia" },
  { section: "addresses", href: "/konto/adresy", label: "Adresy" },
  { section: "files", href: "/konto/pliki", label: "Pliki do pobrania" },
] satisfies { section: AccountSection; href: string; label: string }[];

export function getAccountPath(section: AccountSection) {
  return ACCOUNT_NAV_ITEMS.find((item) => item.section === section)?.href ?? "/konto";
}
