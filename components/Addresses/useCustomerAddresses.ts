/**
 * Odpowiedzialność hooków:
 * - pobierają adres rozliczeniowy i wysyłkowy klienta,
 * - utrzymują stan formularza wybranego adresu,
 * - zapisują zmiany i udostępniają stan operacji oraz komunikaty.
 */
import { useEffect, useRef, useState } from "react";
import { storeApi } from "@/lib/api/client";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone: string;
}

export type CustomerAddressField = { key: keyof CustomerAddress; label: string };

export const EMPTY_CUSTOMER_ADDRESS: CustomerAddress = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  email: "",
  phone: "",
};

export function useCustomerAddresses() {
  const [billing, setBilling] = useState<CustomerAddress | null>(null);
  const [shipping, setShipping] = useState<CustomerAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useAsyncEffect(async ({ isCancelled }) => {
    try {
      const customer = await storeApi("account/addresses", {});
      if (!isCancelled()) { setBilling(customer.billing); setShipping(customer.shipping); }
    } catch { if (!isCancelled()) setError("Nie udało się pobrać adresów."); }
    finally { if (!isCancelled()) setLoading(false); }
  }, []);

  return { billing, shipping, loading, error, setBilling, setShipping };
}

export function useCustomerAddressForm({
  address,
  fields,
  mutationName,
  onSaved,
}: {
  address: CustomerAddress;
  fields: CustomerAddressField[];
  mutationName: "billing" | "shipping";
  onSaved: (address: CustomerAddress) => void;
}) {
  const [form, setForm] = useState<CustomerAddress>(address);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const messageTimer = useRef<number | null>(null);

  const clearMessageTimer = () => {
    if (messageTimer.current !== null) {
      window.clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (messageTimer.current !== null) {
        window.clearTimeout(messageTimer.current);
      }
    };
  }, []);

  function setField(field: keyof CustomerAddress, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveAddress() {
    setSaving(true);
    setMessage("");
    clearMessageTimer();

    const input: Record<string, string> = {};
    for (const field of fields) {
      input[field.key] = form[field.key] ?? "";
    }

    try {
      const updated = await storeApi("account/address", { type: mutationName, address: { ...form, ...input } });
      setForm(updated);
      onSaved(updated);
      setMessage("Zapisano");
      messageTimer.current = window.setTimeout(() => setMessage(""), 3000);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Nie udało się zapisać adresu."); }
    finally { setSaving(false); }
  }

  return {
    form,
    saving,
    message,
    success: message === "Zapisano",
    setField,
    saveAddress,
  };
}
