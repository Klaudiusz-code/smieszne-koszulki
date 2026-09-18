/**
 * Odpowiedzialność komponentu:
 * - prowadzi klienta przez wieloetapowy proces składania zamówienia,
 * - zbiera dane kontaktowe, adresowe, dostawę, płatność i dane do faktury,
 * - synchronizuje formularze z sesją koszyka oraz kontem klienta,
 * - waliduje kroki i finalizuje zamówienie w backendzie.
 */
"use client";

import { usePlaceOrder } from "./usePlaceOrder";
import { RequestError } from "@/components/RequestError";

import { Button } from "@/components/buttons/Button";
import Breadcrumb from "@/components/Breadcrumb";
import { EditButton } from "@/components/buttons/EditButton";
import { CheckoutNavigation } from "@/components/Checkout/CheckoutNavigation";
import Link from "next/link";
import { useState } from "react";
import { useHasHydrated } from "./useHasHydrated";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
import { ParcelLockerIcon } from "@/components/icons/ParcelLockerIcon";
import { TagIcon } from "@/components/icons/TagIcon";
import { TruckIcon } from "@/components/icons/TruckIcon";
import { XIcon } from "@/components/icons/XIcon";
import { ParcelLockerMap } from "@/components/modals/ParcelLockerModal/ParcelLockerMap";
import {
  useCheckout,
  type CartItem,
  type CheckoutAddress,
  type CheckoutStep,
  type PaymentGateway,
  type ShippingRate,
} from "./useCheckout";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { sanitizeGatewayIcon, sanitizeInlineHtml, sanitizePriceHtml } from "@/lib/sanitize-html";

// ── types ──────────────────────────────────────────────────────────────────

// ── constants ──────────────────────────────────────────────────────────────

const inp = "w-full rounded-lg border border-[#d6d3d1] bg-white px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#171717]/40 focus:border-[#78716c] focus:outline-none transition-colors";

// ── helpers ────────────────────────────────────────────────────────────────

function PriceLoading({ className = "w-16" }: { className?: string }) {
  return <span className={`inline-flex h-[1em] ${className} animate-pulse rounded bg-[#e7e5e4] align-middle`} aria-hidden="true" />;
}

function CustomRadio({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${checked ? "border-[#171717]" : "border-[#C4AFA8]"}`}>
      {checked && <span className="h-2 w-2 rounded-full bg-[#171717]" />}
    </span>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-medium uppercase tracking-[0.13em] text-[#171717]/45">{children}</p>;
}

function SaveBtn({ saving, label = "Zapisz" }: { saving?: boolean; label?: string }) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      loading={saving}
      loadingLabel="Zapisywanie…"
    >
      {label}
    </Button>
  );
}

function itemVariant(item: CartItem): string | null {
  const varAttrs = item.variation?.attributes ?? [];
  if (!varAttrs.length) return null;
  const prodAttrs = item.product.attributes ?? [];
  const labelMap: Record<string, string> = {};
  const termMap: Record<string, Record<string, string>> = {};
  for (const a of prodAttrs) {
    labelMap[a.name] = a.label;
    if (a.terms) {
      termMap[a.name] = {};
      for (const t of a.terms) termMap[a.name][t.slug] = t.name;
    }
  }
  return varAttrs.map((a) => `${labelMap[a.name] || a.name}: ${termMap[a.name]?.[a.value] ?? a.value}`).join(" / ");
}

// ── shipping rate icon ──────────────────────────────────────────────────────

function ShippingIcon({ rate }: { rate: ShippingRate }) {
  const m = rate.methodId?.toLowerCase() ?? "";
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5f5f4] text-[#171717]/60">
      {m.includes("paczkomat") || m.includes("inpost") || m.includes("parcel_machines") ? (
        <ParcelLockerIcon className="h-4 w-4" />
      ) : m.includes("pickup") ? (
        <MapPinIcon className="h-4 w-4" />
      ) : m.includes("free") ? (
        <GiftIcon className="h-4 w-4" />
      ) : (
        <TruckIcon className="h-4 w-4" />
      )}
    </span>
  );
}

function GatewayIcon({ gateway }: { gateway: PaymentGateway }) {
  const icon = gateway.icon?.trim();
  if (!icon) return null;
  if (icon.includes("<")) {
    return <span className="flex h-9 min-w-[52px] items-center justify-center rounded-lg bg-[#f5f5f4] px-2 [&_img]:max-h-5 [&_img]:w-auto [&_img]:object-contain" dangerouslySetInnerHTML={{ __html: sanitizeGatewayIcon(icon) }} />;
  }
  return (
    <span className="flex h-9 min-w-[52px] items-center justify-center rounded-lg bg-[#f5f5f4] px-2">
      {/* Adres ikony pochodzi z aktywnej bramki WooCommerce i nie jest znany w czasie buildu. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" className="max-h-5 w-auto object-contain" />
    </span>
  );
}

// ── step indicator ─────────────────────────────────────────────────────────

const STEP_LABELS: Record<CheckoutStep, string> = { 1: "Dostawa", 2: "Płatność", 3: "Podsumowanie" };

function StepIndicator({ step, onGoTo }: { step: CheckoutStep; onGoTo: (step: CheckoutStep) => void }) {
  return (
    <nav aria-label="Etapy zamówienia" className="flex items-center">
      {([1, 2, 3] as CheckoutStep[]).map((s, i) => {
        const done = s < step;
        const active = s === step;
        // Only completed steps are actions. Static labels avoid restored button state on reload.
        const Step = done ? "button" : "span";
        return (
          <div key={s} className={`flex items-center ${i < 2 ? "flex-1" : ""}`}>
            <Step
              type={done ? "button" : undefined}
              onClick={done ? () => onGoTo(s) : undefined}
              aria-current={active ? "step" : undefined}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full px-2 py-1 transition-colors ${active ? "cursor-default" : done ? "hover:opacity-70" : "cursor-default"}`}
            >
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${active ? "bg-[#171717] text-white" : done ? "bg-[#f5f5f4] text-[#171717]" : "border border-[#e7e5e4] text-[#171717]/35"}`}>
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : s}
              </span>
              <span className={`hidden text-sm font-medium sm:block transition-colors ${active ? "text-[#171717]" : done ? "text-[#171717]/55" : "text-[#171717]/30"}`}>
                {STEP_LABELS[s]}
              </span>
            </Step>
            {i < 2 && (
              <div className={`mx-3 h-px flex-1 transition-colors ${s < step ? "bg-[#171717]" : "bg-[#e7e5e4]"}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default function CheckoutView() {
  const {
    error, retry, busy, setAddressDirty, checkoutValid, paymentRequired,
    step,
    setStep,
    state,
    loading,
    selectedPayment,
    setSelectedPayment,
    savingShipping,
    savingBilling,
    selectingShipping,
    showInvoice,
    setShowInvoice,
    couponCode,
    setCouponCode,
    applyingCoupon,
    couponError,
    setCouponError,
    selectedParcelLocker,
    setSelectedParcelLocker,
    pricesStale,
    selectedRate,
    selectedGateway,
    requiresParcelLocker,
    canAdvance,
    saveBillingAddress,
    saveShippingAddress,
    selectShipping,
    applyCoupon,
    removeCoupon,
  } = useCheckout();
  const order = usePlaceOrder(retry);
  const [invoiceTaxId, setInvoiceTaxId] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const hasHydrated = useHasHydrated();
  const dataLoading = loading || !hasHydrated;
  const pricesLoading = pricesStale || !hasHydrated;
  const canPlaceOrder = Boolean(checkoutValid && acceptedTerms && order.available && !order.submitting && !order.pendingAttempt);

  if (hasHydrated && !loading && !error && !order.checking && !order.pendingAttempt && state.items.length === 0) return null;

  // ── render ──

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Koszyk", href: "/koszyk" },
          { label: "Zamówienie" },
        ]}
      />

      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[34px] font-medium tracking-tight text-[#171717] sm:text-[36px]">
          <b>Zamówienie</b>
        </h1>
        <Link
          href="/koszyk"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-500 transition-colors hover:border-black hover:text-black sm:px-4 sm:text-sm"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Wróć do koszyka
        </Link>
      </header>

      {error && <RequestError message={error} onRetry={retry} busy={busy || loading} />}

      {!order.checking && !order.available && <RequestError message="Składanie zamówień jest chwilowo niedostępne. Spróbuj ponownie później lub skontaktuj się ze sklepem." onRetry={order.retryAvailability} busy={order.checking} />}
      {order.orderError && <RequestError message={order.orderError} />}
      {order.pendingAttempt && <div className="rounded-xl border border-stone-200 p-4"><p className="mb-3 text-sm">Sprawdź wynik poprzedniej próby zamówienia.</p><Button onClick={() => void order.checkAttempt()} loading={order.submitting}>Sprawdź zamówienie</Button></div>}

      {/* step indicator */}
      <StepIndicator step={step} onGoTo={setStep} />

      {/* grid */}
      <fieldset disabled={busy || loading || Boolean(error) || order.submitting || Boolean(order.pendingAttempt)} className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_352px] xl:grid-cols-[minmax(0,1fr)_376px] lg:items-start">

        {/* ── LEFT: step content ── */}
        <div className="space-y-4">

          {/* STEP 1 – Dostawa */}
          {step === 1 && (
            <section className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">
              <h2 className="mb-5 text-[17px] font-medium text-[#171717]">Dane kontaktowe i dostawa</h2>

              <SubLabel>E-mail i telefon</SubLabel>
              <ContactFields
                onDirty={(dirty) => setAddressDirty("billing", dirty)}
                key={dataLoading ? "contact-loading" : "contact-ready"}
                billing={dataLoading ? null : state.billing}
                loading={dataLoading || busy}
                saving={busy || savingBilling}
                onSave={async (fields) => {
                  await saveBillingAddress({ ...state.billing!, ...fields });
                }}
              />

              <div className="my-5 border-t border-[#F0EAE5]" />

              <SubLabel>Adres wysyłki</SubLabel>
              <AddressForm
                onDirty={(dirty) => setAddressDirty("shipping", dirty)}
                key={dataLoading ? "shipping-loading" : "shipping-ready"}
                address={dataLoading ? null : state.shipping}
                loading={dataLoading || busy}
                saving={busy || savingShipping}
                onSave={saveShippingAddress}
              />

              {!dataLoading && state.shippingRates.length > 0 && (
                <>
                  <div className="my-5 border-t border-[#F0EAE5]" />
                  <SubLabel>Metoda wysyłki</SubLabel>
                  <div className="space-y-2">
                    {state.shippingRates.map((rate) => {
                      const chosen = state.chosenShipping.includes(rate.id);
                      return (
                        <label
                          key={rate.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                            chosen
                              ? "border-[#171717] bg-[#171717]/[0.035] ring-1 ring-[#171717]"
                              : "border-[#e7e5e4] bg-white hover:border-[#C4AFA8] hover:bg-[#FAF7F5]"
                          } ${selectingShipping ? "pointer-events-none opacity-60" : ""}`}
                        >
                          <input type="radio" name="shipping" checked={chosen} onChange={() => void selectShipping(rate.id)} className="sr-only" />
                          <CustomRadio checked={chosen} />
                          <ShippingIcon rate={rate} />
                          <span className="flex-1 text-sm text-[#171717]">{rate.label}</span>
                          <span className="flex-shrink-0 text-sm font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(rate.cost) }} />
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {requiresParcelLocker && (
                <>
                  <div className="my-5 border-t border-[#F0EAE5]" />
                  <SubLabel>Wybierz paczkomat</SubLabel>
                  <ParcelLockerMap
                    value={selectedParcelLocker}
                    onChange={setSelectedParcelLocker}
                  />
                </>
              )}

              {state.shippingRates.length === 0 && (
                <p className="mt-4 text-sm text-[#171717]/45">
                  Zapisz adres, aby zobaczyć dostępne metody dostawy.
                </p>
              )}
            </section>
          )}

          {/* STEP 2 – Płatność */}
          {step === 2 && (
            <section className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">
              <h2 className="mb-5 text-[17px] font-medium text-[#171717]">Metoda płatności</h2>

              {state.paymentGateways.length > 0 ? (
                <div className="space-y-2">
                  {state.paymentGateways.map((gw) => (
                    <label
                      key={gw.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                        selectedPayment === gw.id
                          ? "border-[#171717] bg-[#171717]/[0.035] ring-1 ring-[#171717]"
                          : "border-[#e7e5e4] bg-white hover:border-[#C4AFA8] hover:bg-[#FAF7F5]"
                      }`}
                    >
                      <input type="radio" name="payment" checked={selectedPayment === gw.id} onChange={() => setSelectedPayment(gw.id)} className="sr-only" />
                      <CustomRadio checked={selectedPayment === gw.id} />
                      <GatewayIcon gateway={gw} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#171717]">{gw.title}</span>
                        {gw.description && (
                          <span className="mt-0.5 block text-xs leading-5 text-[#171717]/50 [&_a]:underline [&_a]:underline-offset-2" dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(gw.description) }} />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#171717]/45">{paymentRequired ? "Brak dostępnych metod płatności." : "To zamówienie nie wymaga płatności."}</p>
              )}

              <div className="my-5 border-t border-[#F0EAE5]" />

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={showInvoice}
                  onChange={(e) => setShowInvoice(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C4AFA8] bg-[#f5f5f4] text-[#171717] focus:ring-[#171717] focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-[#171717]">Chcę otrzymać fakturę VAT</span>
              </label>
              {showInvoice && (
                <div className="mt-4">
                  <SubLabel>Dane do faktury</SubLabel>
                  <label className="mb-3 block text-sm">NIP (opcjonalnie)<input className={inp} value={invoiceTaxId} onChange={(event) => setInvoiceTaxId(event.target.value)} maxLength={20} autoComplete="off" /></label>
                  <InvoiceForm
                    onDirty={(dirty) => setAddressDirty("invoice", dirty)}
                    billing={state.billing}
                    saving={busy || savingBilling}
                    onSave={async (addr) => {
                      const saved = await saveBillingAddress({ ...state.billing!, ...addr });
                      if (saved) setAddressDirty("invoice", false);
                    }}
                  />
                </div>
              )}
            </section>
          )}

          {/* STEP 3 – Podsumowanie */}
          {step === 3 && (
            <div className="space-y-3">
              {/* Dostawa */}
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-medium text-[#171717]">Dostawa</h3>
                  <EditButton onClick={() => setStep(1)} />
                </div>

                <div className="mt-4 space-y-3 text-sm text-[#171717]/70">
                  {(state.billing?.email || state.billing?.phone) && (
                    <div className="flex flex-col gap-0.5">
                      {state.billing?.email && <span>{state.billing.email}</span>}
                      {state.billing?.phone && <span>{state.billing.phone}</span>}
                    </div>
                  )}

                  {state.shipping?.address1 && (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#171717]">
                        {state.shipping.firstName} {state.shipping.lastName}
                      </span>
                      <span>{state.shipping.address1}{state.shipping.address2 ? `, ${state.shipping.address2}` : ""}</span>
                      <span>{state.shipping.postcode} {state.shipping.city}</span>
                    </div>
                  )}

                  {selectedRate && (
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#f5f5f4] px-3.5 py-2.5">
                      <ShippingIcon rate={selectedRate} />
                      <span className="flex-1 text-sm text-[#171717]">{selectedRate.label}</span>
                      <span className="text-sm font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(selectedRate.cost) }} />
                    </div>
                  )}

                  {selectedParcelLocker && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#C4AFA8] bg-white px-3.5 py-3">
                      <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#171717]/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#171717]">{selectedParcelLocker.name}</p>
                        <p className="mt-0.5 text-xs text-[#171717]/60">{selectedParcelLocker.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Płatność */}
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-medium text-[#171717]">Płatność</h3>
                  <EditButton onClick={() => setStep(2)} />
                </div>

                {selectedGateway ? (
                  <div className="mt-4 flex items-center gap-3">
                    <GatewayIcon gateway={selectedGateway} />
                    <span className="text-sm font-medium text-[#171717]">{selectedGateway.title}</span>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#171717]/45">{paymentRequired ? "Brak wybranej metody płatności." : "To zamówienie nie wymaga płatności."}</p>
                )}

                {showInvoice && (state.billing?.address1 || state.billing?.city) && (
                  <div className="mt-4 border-t border-[#F0EAE5] pt-4 text-sm text-[#171717]/70">
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-[#171717]/40">Faktura VAT</p>
                    <p className="font-medium text-[#171717]">{state.billing?.company && <span className="block">{state.billing.company}</span>}{state.billing?.firstName} {state.billing?.lastName}</p>
                    {invoiceTaxId.trim() && <p>NIP: {invoiceTaxId.trim()}</p>}
                    {state.billing?.address1 && <p>{state.billing.address1}</p>}
                    {state.billing?.city && <p>{state.billing.postcode} {state.billing.city}</p>}
                  </div>
                )}
              </div>

              {/* Zasady sklepu */}
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">
                <h3 className="text-[15px] font-medium text-[#171717]">Zasady sklepu</h3>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e7e5e4] bg-[#FAF7F5] p-3.5 transition-colors hover:border-[#C4AFA8]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[#C4AFA8] bg-white text-[#171717] focus:ring-[#171717] focus:ring-offset-0"
                  />
                  <span className="text-sm leading-6 text-[#171717]/75">
                    Akceptuję{" "}
                    <Link href="/regulamin" className="font-medium text-[#27ae60] underline underline-offset-4 hover:text-[#171717]">
                      Regulamin sklepu
                    </Link>{" "}
                    i potwierdzam, że przed złożeniem zamówienia zapoznałam/zapoznałem się z{" "}
                    <Link href="/polityka-prywatnosci" className="font-medium text-[#27ae60] underline underline-offset-4 hover:text-[#171717]">
                      Polityką prywatności
                    </Link>{" "}
                    oraz{" "}
                    <Link href="/zwroty" className="font-medium text-[#27ae60] underline underline-offset-4 hover:text-[#171717]">
                      informacją o odstąpieniu od umowy
                    </Link>.
                  </span>
                </label>
                <p className="mt-3 text-xs leading-5 text-[#171717]/50">
                  Zgody marketingowe nie są wymagane do złożenia zamówienia.
                </p>
              </div>
            </div>
          )}

          {/* CTA row */}
          <CheckoutNavigation
            showBack={step > 1}
            finalStep={step === 3}
            canContinue={step === 3 ? canPlaceOrder : canAdvance}
            onBack={() => setStep((currentStep) => (currentStep - 1) as CheckoutStep)}
            onContinue={() => setStep((currentStep) => (currentStep + 1) as CheckoutStep)}
            placingOrder={order.submitting}
            onPlaceOrder={() => {
              if (!canPlaceOrder) return;
              const billing = showInvoice ? state.billing : { ...state.shipping, email: state.billing?.email, phone: state.billing?.phone };
              void order.placeOrder({
                acceptedTerms, expectedTotal: Number(state.rawTotal),
                billing, shipping: state.shipping, shippingMethods: state.chosenShipping, paymentMethod: selectedPayment,
                parcelLocker: requiresParcelLocker ? selectedParcelLocker?.name : undefined,
                invoiceRequested: showInvoice, invoiceTaxId: showInvoice ? invoiceTaxId.trim() : undefined,
              });
            }}
          />
        </div>

        {/* ── RIGHT: sidebar ── */}
        <aside className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 sm:p-6">

            {/* Items */}
              <div className="divide-y divide-[#F0EAE5]">
                {dataLoading ? (
                  [0, 1].map((item) => (
                    <div key={item} className="flex animate-pulse items-center gap-3 py-3 first:pt-0 last:pb-0" aria-hidden="true">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-[#e7e5e4]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-[#e7e5e4]" />
                        <div className="h-2.5 w-1/2 rounded bg-[#e7e5e4]" />
                      </div>
                      <div className="h-3 w-12 rounded bg-[#e7e5e4]" />
                    </div>
                  ))
                ) : state.items.map((item) => {
                  const variant = itemVariant(item);
                  return (
                    <Link
                      key={item.key}
                      href={`/produkt/${item.product.slug || item.product.databaseId}`}
                      className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#f5f5f4] ring-1 ring-transparent transition-colors group-hover:ring-stone-300">
                        <ProductThumbnail
                          src={item.product.image?.sourceUrl}
                          alt={item.product.image?.altText || item.product.name}
                          sizes="48px"
                          placeholderIconClassName="h-4 w-4 text-[#B8AAA2]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#171717] transition-colors group-hover:text-[#27ae60]">{item.product.name}</p>
                        {variant && <p className="mt-0.5 truncate text-[11px] text-[#171717]/45">{variant}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs font-semibold text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(item.total) }} />
                        <p className="mt-0.5 text-[11px] text-[#171717]/45">× {item.quantity}</p>
                      </div>
                    </Link>
                );
              })}
            </div>

            {/* Coupon */}
            <div className="mt-4 border-t border-[#F0EAE5] pt-4">
              <form className="flex items-center gap-0 overflow-hidden rounded-lg border border-[#d6d3d1] bg-white focus-within:border-[#78716c] transition-colors" onSubmit={(e) => {
                e.preventDefault();
                if (!dataLoading) void applyCoupon();
              }}>
                <input
                  type="text"
                  placeholder="Kod rabatowy…"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#171717]/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim() || applyingCoupon}
                  className="px-3.5 py-2.5 text-sm text-[#171717]/50 transition-colors hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {applyingCoupon ? "…" : "Zastosuj"}
                </button>
              </form>
              {couponError && <p role="alert" className="mt-2 text-xs text-[#A63A2A]">{couponError}</p>}
              {state.appliedCoupons.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {state.appliedCoupons.map((c) => (
                    <div key={c.code} className="flex items-center gap-1.5 rounded-full border border-[#A8C99A] bg-[#F0F7EB] px-2.5 py-1">
                      <TagIcon className="h-3 w-3 text-[#4A8C38]" />
                      <span className="text-xs font-medium uppercase tracking-wide text-[#3A7030]">{c.code}</span>
                      <span className="text-xs text-[#4A8C38]/70">·</span>
                      <span className="text-xs text-[#4A8C38]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(c.discountAmount) }} />
                      <button type="button" onClick={() => void removeCoupon(c.code)} aria-label={`Usuń kupon ${c.code}`} className="ml-0.5 text-[#4A8C38]/55 transition-colors hover:text-[#3A7030]">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#171717]/60">Produkty</span>
                {pricesLoading ? <PriceLoading /> : <span className="font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(state.subtotal) }} />}
              </div>
              {state.appliedCoupons.map((c) => (
                <div key={c.code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-[#4A8C38]">
                    <TagIcon className="h-3 w-3" />{c.code}
                  </span>
                  {pricesLoading ? <PriceLoading className="w-12" /> : <span className="text-[#4A8C38]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(c.discountAmount) }} />}
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#171717]/60">Dostawa</span>
                {pricesLoading ? <PriceLoading className="w-12" /> : (
                  state.shippingTotal
                    ? <span className="font-medium text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(state.shippingTotal) }} />
                    : <span className="text-xs text-[#171717]/40">Do ustalenia</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEE8E3] pt-4">
              <span className="text-sm font-medium text-[#171717]">Razem</span>
              {pricesLoading
                ? <PriceLoading className="h-[22px] w-20" />
                : <span className="text-[22px] font-semibold leading-none text-[#171717]" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(state.total) }} />
              }
            </div>

          </div>
        </aside>
      </fieldset>
    </div>
  );
}

// ── AddressForm ────────────────────────────────────────────────────────────

function AddressForm({ address, loading, saving, onSave, onDirty }: {
  address: CheckoutAddress | null;
  loading?: boolean;
  saving?: boolean;
  onDirty: (dirty: boolean) => void;
  onSave: (address: CheckoutAddress) => Promise<unknown>;
}) {
  const blank: CheckoutAddress = {
    firstName: address?.firstName ?? "", lastName: address?.lastName ?? "",
    address1: address?.address1 ?? "", address2: address?.address2 ?? "",
    city: address?.city ?? "", postcode: address?.postcode ?? "",
    country: address?.country ?? "PL", phone: address?.phone ?? "",
  };
  const [form, setForm] = useState<CheckoutAddress>(blank);
  const hasChanges = (Object.keys(blank) as (keyof CheckoutAddress)[]).some((k) => form[k] !== blank[k]);
  const set = (f: keyof CheckoutAddress, v: string) => {
    const next = { ...form, [f]: v };
    setForm(next);
    onDirty((Object.keys(blank) as (keyof CheckoutAddress)[]).some((key) => next[key] !== blank[key]));
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSave(form); }} className="space-y-2.5" aria-busy={loading}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input className={inp} placeholder="Imię" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} disabled={loading} required />
        <input className={inp} placeholder="Nazwisko" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} disabled={loading} required />
      </div>
      <input className={inp} placeholder="Ulica i numer" value={form.address1} onChange={(e) => set("address1", e.target.value)} disabled={loading} required />
      <input className={inp} placeholder="Adres cd. (opcjonalnie)" value={form.address2} onChange={(e) => set("address2", e.target.value)} disabled={loading} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input className={inp} placeholder="Kod pocztowy" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} disabled={loading} required />
        <input className={inp} placeholder="Miasto" value={form.city} onChange={(e) => set("city", e.target.value)} disabled={loading} required />
      </div>
      <input className={inp} placeholder="Telefon" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={loading} required />
      {hasChanges && <div className="pt-1"><SaveBtn saving={saving} label="Zapisz adres" /></div>}
    </form>
  );
}

// ── ContactFields ──────────────────────────────────────────────────────────

function ContactFields({ billing, loading, saving, onSave, onDirty }: {
  billing: CheckoutAddress | null;
  loading?: boolean;
  saving?: boolean;
  onDirty: (dirty: boolean) => void;
  onSave: (fields: Pick<CheckoutAddress, "email" | "phone" | "country">) => Promise<unknown>;
}) {
  const [email, setEmail] = useState(billing?.email ?? "");
  const [phone, setPhone] = useState(billing?.phone ?? "");
  const country = billing?.country ?? "PL";
  const hasChanges = email !== (billing?.email ?? "") || phone !== (billing?.phone ?? "");

  return (
    <form className="space-y-2.5" aria-busy={loading} onSubmit={async (e) => { e.preventDefault(); await onSave({ email, phone, country }); }}>
      <input className={inp} placeholder="E-mail" type="email" value={email} onChange={(e) => { setEmail(e.target.value); onDirty(e.target.value !== (billing?.email ?? "") || phone !== (billing?.phone ?? "")); }} disabled={loading} required />
      <input className={inp} placeholder="Telefon" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); onDirty(email !== (billing?.email ?? "") || e.target.value !== (billing?.phone ?? "")); }} disabled={loading} required />
      {hasChanges && <div className="pt-1"><SaveBtn saving={saving} label="Zapisz dane" /></div>}
    </form>
  );
}

// ── InvoiceForm ────────────────────────────────────────────────────────────

function InvoiceForm({ billing, saving, onSave, onDirty }: {
  billing: CheckoutAddress | null;
  saving?: boolean;
  onDirty: (dirty: boolean) => void;
  onSave: (fields: Omit<CheckoutAddress, "email" | "phone" | "country">) => Promise<unknown>;
}) {
  const blank = {
    company: billing?.company ?? "",
    firstName: billing?.firstName ?? "", lastName: billing?.lastName ?? "",
    address1: billing?.address1 ?? "", address2: billing?.address2 ?? "",
    city: billing?.city ?? "", postcode: billing?.postcode ?? "",
  };
  const [form, setForm] = useState(blank);
  const hasChanges = (Object.keys(blank) as (keyof typeof blank)[]).some((k) => form[k] !== blank[k]);
  const set = (f: keyof typeof form, v: string) => {
    const next = { ...form, [f]: v };
    setForm(next);
    onDirty((Object.keys(blank) as (keyof typeof blank)[]).some((key) => next[key] !== blank[key]));
  };

  return (
    <form className="space-y-2.5" onSubmit={async (e) => { e.preventDefault(); await onSave(form); }}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input className={inp} placeholder="Imię" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
        <input className={inp} placeholder="Nazwisko" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
      </div>
      <input className={inp} placeholder="Firma (opcjonalnie)" value={form.company} onChange={(e) => set("company", e.target.value)} />
      <input className={inp} placeholder="Ulica i numer" value={form.address1} onChange={(e) => set("address1", e.target.value)} required />
      <input className={inp} placeholder="Adres cd. (opcjonalnie)" value={form.address2} onChange={(e) => set("address2", e.target.value)} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input className={inp} placeholder="Kod pocztowy" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} required />
        <input className={inp} placeholder="Miasto" value={form.city} onChange={(e) => set("city", e.target.value)} required />
      </div>
      {hasChanges && <div className="pt-1"><SaveBtn saving={saving} label="Zapisz dane" /></div>}
    </form>
  );
}
