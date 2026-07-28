/**
 * Odpowiedzialność hooka:
 * - łączy współdzielone dane checkoutu z formularzem tego sklepu,
 * - zarządza krokami, adresami, dostawą, płatnością, kuponami i paczkomatem,
 * - waliduje możliwość przejścia dalej oraz aktualizuje wyceny,
 * - pozostawia transport i zapisy bibliotece commerce.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCheckout as useCheckoutData } from "@/packages/commerce/react";
import type { Checkout as CheckoutState, CheckoutAddress, ShippingRate } from "@/packages/commerce/core";
import { checkoutAttempts } from "@/lib/store/browser";
import { CommerceError } from "@/packages/commerce/core";
import { htmlToPlainText } from "@/lib/html-text";
export type { CartItem, CheckoutAddress, ShippingRate, PaymentGateway } from "@/packages/commerce/core";

export type CheckoutStep = 1 | 2 | 3;
export type ParcelLocker = { name: string; address: string };

function createEmptyCheckoutState(): CheckoutState {
  return { items: [], appliedCoupons: [], subtotal: "", shippingTotal: "", total: "", rawTotal: "",
    shippingRates: [], chosenShipping: [], paymentGateways: [], billing: null, shipping: null };
}

const EMPTY_CHECKOUT = createEmptyCheckoutState();

export function isParcelLockerRate(rate: ShippingRate): boolean {
  const methodId = rate.methodId?.toLowerCase() ?? "";
  return /paczkomat|parcel_machine|parcel_locker/.test(methodId);
}

export function useCheckout() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>(1);
  const data = useCheckoutData();
  const state = data.checkout ?? EMPTY_CHECKOUT;
  const loading = data.loading;
  const busyAction = data.action;
  const error = data.error ? "Nie udało się potwierdzić danych zamówienia. Odśwież je przed kolejną zmianą." : null;
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [selectedParcelLocker, setSelectedParcelLocker] = useState<ParcelLocker | null>(null);

  useEffect(() => {
    if (loading || error || state.items.length) return;
    try { if (!checkoutAttempts.current()) router.replace("/koszyk"); }
    catch { /* Finalization presents the browser storage error. */ }
  }, [loading, error, state.items.length, router]);

  function retry() { void data.refresh().catch(() => {}); }

  async function update(action: string, mutate: () => Promise<unknown>) {
    if (data.busy || loading || error) return false;
    setCouponError(null);
    try { await mutate(); return true; }
    catch (cause) {
      if (action === "coupon") setCouponError(cause instanceof CommerceError && (cause.code === "graphql" || cause.code === "validation")
        ? htmlToPlainText(cause.message)
        : "Nie udało się potwierdzić zmiany kuponu. Sprawdź kupony w podsumowaniu przed ponowną próbą.");
      return false;
    }
  }

  function setAddressDirty(section: string, value: boolean) {
    setDirty((current) => ({ ...current, [section]: value }));
  }

  async function saveAddress(type: "billing" | "shipping", address: CheckoutAddress) {
    const saved = await update(type, () => data.saveAddress(type, address));
    if (saved) setAddressDirty(type, false);
    return saved;
  }

  async function selectShipping(id: string) {
    const nextRate = state.shippingRates.find((rate) => rate.id === id);
    if (!nextRate) return;
    const saved = await update("shippingMethod", () => data.selectShipping([id]));
    if (saved && !isParcelLockerRate(nextRate)) setSelectedParcelLocker(null);
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    const saved = await update("coupon", () => data.applyCoupon(couponCode.trim()));
    if (saved) setCouponCode("");
  }

  async function removeCoupon(code: string) {
    await update("coupon", () => data.removeCoupon(code));
  }

  const pricesStale = loading || busyAction !== null || Boolean(error);
  const selectedRate = state.shippingRates.find((rate) => state.chosenShipping.includes(rate.id));
  const selectedGateway = state.paymentGateways.find((gateway) => gateway.id === selectedPayment);
  const requiresParcelLocker = selectedRate ? isParcelLockerRate(selectedRate) : false;
  const shipping = state.shipping;
  const billing = state.billing;
  const addressValid = (address: CheckoutAddress | null) => Boolean(address?.firstName?.trim() && address.lastName?.trim() && address.address1?.trim() && address.city?.trim() && address.postcode?.trim() && address.country);
  const step1Valid = Boolean(!pricesStale && !dirty.billing && !dirty.shipping && addressValid(shipping) && billing?.email?.trim() && billing.phone?.trim() && selectedRate && (!requiresParcelLocker || selectedParcelLocker));
  const paymentRequired = Number(state.rawTotal) > 0;
  const step2Valid = Boolean(step1Valid && (!paymentRequired || selectedGateway) && (!showInvoice || (!dirty.invoice && addressValid(billing))) && state.rawTotal.trim() && Number.isFinite(Number(state.rawTotal)));
  const canAdvance = step === 1 ? step1Valid : step === 2 ? step2Valid : false;

  return {
    step, setStep, state, loading, selectedPayment, setSelectedPayment,
    savingShipping: busyAction === "shipping", savingBilling: busyAction === "billing",
    selectingShipping: busyAction === "shippingMethod", showInvoice, setShowInvoice,
    couponCode, setCouponCode, applyingCoupon: busyAction === "coupon", couponError, setCouponError,
    selectedParcelLocker, setSelectedParcelLocker, pricesStale, selectedRate, selectedGateway,
    requiresParcelLocker, canAdvance, paymentRequired, checkoutValid: step2Valid,
    saveBillingAddress: (address: CheckoutAddress) => saveAddress("billing", address),
    saveShippingAddress: (address: CheckoutAddress) => saveAddress("shipping", address),
    selectShipping, applyCoupon, removeCoupon, error, retry, setAddressDirty,
    busy: busyAction !== null,
  };
}
