"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Resource } from "../core/resource";
import type { PlaceOrderInput, ProductFilters, ProductPage } from "../core/models";
import { commerceError, type CommerceError } from "../core/errors";
import { createProductListing } from "../core/products";
import { useCommerce } from "./provider";

export function useResource<T>(resource: Resource<T>) {
  const state = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getServerSnapshot);
  useEffect(() => { if (state.status === "idle") void resource.ensure().catch(() => {}); }, [resource, state.status]);
  return { ...state, loading: state.status === "idle" || state.status === "loading", busy: state.action !== null, refresh: resource.refresh };
}

export function useCart() {
  const store = useCommerce();
  const state = useResource(store.cart);
  return {
    ...state, cart: state.data,
    count: state.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    addItem: store.addItem, removeItems: store.removeItems, updateQuantity: store.updateQuantity,
  };
}

export function useCheckout() {
  const store = useCommerce();
  const state = useResource(store.checkout);
  useEffect(() => { void store.checkout.refresh().catch(() => {}); }, [store]);
  return {
    ...state, checkout: state.data,
    saveAddress: store.saveAddress, selectShipping: store.selectShipping,
    applyCoupon: store.applyCoupon, removeCoupon: store.removeCoupon,
  };
}

export function useProducts(filters: ProductFilters, initial: ProductPage) {
  const { adapter } = useCommerce();
  // Structural key: callers may create a fresh filters object on every render.
  const filtersKey = JSON.stringify(filters);
  const listing = useMemo(() => createProductListing(adapter, JSON.parse(filtersKey), initial), [adapter, filtersKey, initial]);
  const state = useResource(listing.resource);
  return { ...state, result: state.data ?? initial, loadMore: listing.loadMore };
}

export function usePlaceOrder(checkAvailability: () => Promise<boolean>) {
  const store = useCommerce();
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState<string | null>(null);
  const [error, setError] = useState<CommerceError | null>(null);
  const [checkKey, setCheckKey] = useState(0);
  const locked = useRef(false);

  useEffect(() => {
    let active = true;
    async function check() {
      setChecking(true);
      setError(null);
      try {
        setPendingAttempt(store.order.current());
        const supported = await checkAvailability();
        if (active) setAvailable(supported);
      } catch (cause) {
        if (active) { setAvailable(false); setError(commerceError(cause)); }
      } finally { if (active) setChecking(false); }
    }
    void check();
    return () => { active = false; };
  }, [store, checkAvailability, checkKey]);

  async function run(input?: PlaceOrderInput) {
    if (locked.current || (input && (!available || checking))) return;
    locked.current = true;
    setSubmitting(true);
    setError(null);
    try {
      return await (input ? store.order.submit(input) : store.order.recover());
    } catch (cause) {
      setError(commerceError(cause));
    } finally {
      try { setPendingAttempt(store.order.current()); } catch (cause) { setError(commerceError(cause)); }
      locked.current = false;
      setSubmitting(false);
    }
  }
  return {
    available, checking, submitting, pendingAttempt, error,
    submit: (input: PlaceOrderInput) => run(input), recover: () => run(),
    retryAvailability: () => setCheckKey((key) => key + 1),
  };
}
