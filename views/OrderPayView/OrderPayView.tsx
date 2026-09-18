/**
 * Odpowiedzialność komponentu:
 * - pobiera dane zamówienia oczekującego na płatność,
 * - prezentuje stan zamówienia i dostępne dalsze działania,
 * - przekierowuje klienta do właściwego procesu płatności lub panelu zamówień.
 */
"use client";

import { acknowledgeCheckoutOrder } from "@/lib/checkout-attempt";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";

import { Button } from "@/components/buttons/Button";
import Link from "next/link";
import { useState } from "react";
import { sanitizePriceHtml } from "@/lib/sanitize-html";
import { LockIcon } from "@/components/icons/LockIcon";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import { TruckIcon } from "@/components/icons/TruckIcon";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { storeApi } from "@/lib/api/client";

interface OrderLineItem {
  name: string;
  quantity: number;
}

interface OrderData {
  databaseId: number;
  orderNumber: string;
  status: string;
  date: string;
  subtotal: string | null;
  shippingTotal: string | null;
  total: string | null;
  paymentMethodTitle: string | null;
  shippingMethodTitle: string | null;
  needsPayment: boolean | null;
  lineItems: OrderLineItem[];
}

type LoadState = "loading" | "loaded" | "unavailable";

function Stat({ label, value, html }: { label: string; value?: React.ReactNode; html?: string | null }) {
  return (
    <div className="rounded-lg border border-[#EEE3DC] bg-[#FFFCFA] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#171717]/45">{label}</p>
      {html ? (
        <p className="mt-2 text-[17px] font-semibold text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(html) }} />
      ) : (
        <p className="mt-2 text-[17px] font-semibold text-[#171717]">{value}</p>
      )}
    </div>
  );
}

function LoadingState({ orderId }: { orderId: string }) {
  return (
    <div className="my-[64px] max-w-[960px]">
      <div className="rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(78,52,46,0.10)] sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-[#f5f5f4]" />
          <div className="space-y-3">
            <div className="h-7 w-64 max-w-full animate-pulse rounded bg-[#f5f5f4]" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#f5f5f4]" />
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-[#f5f5f4]" />
          ))}
        </div>
        <p className="mt-6 text-sm text-[#171717]/55">Ładowanie zamówienia #{orderId}…</p>
      </div>
    </div>
  );
}

function UnavailableState({ orderId }: { orderId: string }) {
  return (
    <div className="my-[64px] max-w-[960px]">
      <section className="rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(78,52,46,0.10)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-full bg-[#f5f5f4] text-[#171717]">
            <LockIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#171717]/45">Zamówienie #{orderId}</p>
            <h1 className="mt-3 text-[32px] font-medium leading-tight text-[#171717] sm:text-[36px]">
              Nie możemy wyświetlić zamówienia
            </h1>
            <p className="mt-4 max-w-[700px] text-[17px] leading-7 text-[#171717]/68">
              Link do płatności mógł wygasnąć lub być nieprawidłowy. Sprawdź e-mail z potwierdzeniem lub zaloguj się, aby zobaczyć historię zamówień.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sklep"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#171717] px-5 text-sm font-medium text-white transition-colors hover:bg-[#000000]"
          >
            Wróć do sklepu
          </Link>
          {ACCOUNT_FEATURES_ENABLED && (<Link
            href="/konto/zamowienia"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#F1E7E0] px-5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#E7D8CE]"
          >
            Moje zamówienia
          </Link>)}
        </div>
      </section>
    </div>
  );
}

function AlreadyPaidState({ order }: { order: OrderData }) {
  return (
    <div className="my-[64px] max-w-[960px]">
      <section className="rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(78,52,46,0.10)] sm:p-8">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#171717]/45">
            Zamówienie #{order.orderNumber}
          </p>
          <h1 className="mt-3 text-[32px] font-medium leading-tight text-[#171717] sm:text-[36px]">
            Zamówienie jest już opłacone
          </h1>
          <p className="mt-4 max-w-[700px] text-[17px] leading-7 text-[#171717]/68">
            To zamówienie nie wymaga płatności — zostało już opłacone lub anulowane.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sklep"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#171717] px-5 text-sm font-medium text-white transition-colors hover:bg-[#000000]"
          >
            Wróć do sklepu
          </Link>
          {ACCOUNT_FEATURES_ENABLED && (<Link
            href="/konto/zamowienia"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#F1E7E0] px-5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#E7D8CE]"
          >
            Moje zamówienia
          </Link>)}
        </div>
      </section>
    </div>
  );
}

export default function OrderPayView({ orderId, orderKey }: { orderId: string; orderKey?: string }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const cleanOrderId = orderId.trim();
  const cleanOrderKey = orderKey?.trim() ?? "";

  useAsyncEffect(async ({ isCancelled }) => {
    const numericId = parseInt(cleanOrderId, 10);
    if (!numericId || !cleanOrderKey) {
      setLoadState("unavailable");
      return;
    }

    try {
      const nextOrder = await storeApi("orders/receipt", { orderId: numericId, orderKey: cleanOrderKey });
      if (isCancelled()) return;
      if (!nextOrder) { setLoadState("unavailable"); return; }

      acknowledgeCheckoutOrder(nextOrder.databaseId);
      setOrder(nextOrder);
      setLoadState("loaded");
    } catch {
      if (!isCancelled()) setLoadState("unavailable");
    }
  }, [cleanOrderId, cleanOrderKey]);

  async function handlePay() {
    if (paying || !order) return;
    setPaying(true);
    setPayError(null);

    try {
      const result = await storeApi("orders/payment", { orderId: order.databaseId, orderKey: cleanOrderKey });

      if (result?.success && result.redirectUrl) {
        try {
          const url = new URL(result.redirectUrl);
          if (url.protocol === "https:") {
            window.location.href = result.redirectUrl;
            return;
          }
        } catch {
          // invalid URL — fall through to error
        }
      }

      setPayError(result?.message ?? "Wystąpił błąd. Spróbuj ponownie.");
    } catch {
      setPayError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setPaying(false);
    }
  }

  if (loadState === "loading") return <LoadingState orderId={cleanOrderId || orderId} />;
  if (loadState !== "loaded" || !order) {
    return <UnavailableState orderId={cleanOrderId || orderId} />;
  }
  if (!order.needsPayment) {
    return <AlreadyPaidState order={order} />;
  }

  return (
    <div className="my-[64px] max-w-[1040px]">
      <section className="rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(78,52,46,0.10)] sm:p-8">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#171717]/45">
            Zamówienie #{order.orderNumber}
          </p>
          <h1 className="mt-3 text-[32px] font-medium leading-tight text-[#171717] sm:text-[36px]">
            Dokończ płatność
          </h1>
          <p className="mt-4 max-w-[700px] text-[17px] leading-7 text-[#171717]/68">
            Twoje zamówienie oczekuje na płatność. Kliknij poniżej, aby przejść do bramki płatniczej.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Numer" value={`#${order.orderNumber}`} />
          <Stat label="Suma" html={order.total} />
          {order.paymentMethodTitle && <Stat label="Płatność" value={order.paymentMethodTitle} />}
          {order.shippingMethodTitle && <Stat label="Dostawa" value={order.shippingMethodTitle} />}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[#EEE3DC] bg-[#FFFCFA] p-5">
            <div className="flex items-center gap-3">
              <ShoppingBagIcon className="h-5 w-5 text-[#171717]/55" />
              <h2 className="text-[17px] font-medium text-[#171717]">Produkty</h2>
            </div>
            <div className="mt-4 divide-y divide-[#F0EAE5]">
              {order.lineItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium text-[#171717]">{item.name || "Produkt"}</span>
                  <span className="flex-shrink-0 text-sm text-[#171717]/55">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-[#EEE3DC] bg-[#FFFCFA] p-5">
            <div className="flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-[#171717]/55" />
              <h2 className="text-[17px] font-medium text-[#171717]">Podsumowanie</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {order.subtotal && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#171717]/60">Produkty</span>
                  <span className="font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(order.subtotal) }} />
                </div>
              )}
              {order.shippingTotal && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#171717]/60">Dostawa</span>
                  <span className="font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(order.shippingTotal) }} />
                </div>
              )}
              {order.total && (
                <div className="flex items-center justify-between gap-3 border-t border-[#F0EAE5] pt-3">
                  <span className="font-medium text-[#171717]">Razem</span>
                  <span className="text-[22px] font-semibold leading-none text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(order.total) }} />
                </div>
              )}
            </div>
          </aside>
        </div>

        {payError && (
          <p className="mt-6 rounded-lg bg-[#FDF0ED] px-4 py-3 text-sm text-[#A63A2A]">{payError}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="form"
            onClick={() => void handlePay()}
            loading={paying}
            loadingLabel="Przekierowywanie…"
            className="rounded-lg px-6"
          >
            Zapłać teraz
          </Button>
          {ACCOUNT_FEATURES_ENABLED && (<Link
            href="/konto/zamowienia"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#F1E7E0] px-5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#E7D8CE]"
          >
            Moje zamówienia
          </Link>)}
        </div>
      </section>
    </div>
  );
}
