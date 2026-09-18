/** Pobiera dane konta klienta oraz obsługuje ich edycję i zapis. */
import { useEffect, useRef, useState } from "react";
import { storeApi } from "@/lib/api/client";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";

export interface CustomerAccountForm {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
}

const EMPTY_ACCOUNT_FORM: CustomerAccountForm = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
};

export function useCustomerAccountDetails() {
  const [form, setForm] = useState<CustomerAccountForm>(EMPTY_ACCOUNT_FORM);
  const [loading, setLoading] = useState(true);
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

  useAsyncEffect(async ({ isCancelled }) => {
    try {
      const customer = await storeApi("account", {});
      if (!isCancelled()) setForm(customer);
    } catch { if (!isCancelled()) setMessage("Nie udało się pobrać danych konta."); }
    finally { if (!isCancelled()) setLoading(false); }
  }, []);

  function setField(field: keyof CustomerAccountForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveAccount() {
    setSaving(true);
    setMessage("");
    clearMessageTimer();

    try {
      const customer = await storeApi("account/update", form);
      setForm(customer);
      setMessage("Zapisano zmiany");
      messageTimer.current = window.setTimeout(() => setMessage(""), 3000);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Nie udało się zapisać danych."); }
    finally { setSaving(false); }
  }

  return {
    form,
    loading,
    saving,
    message,
    success: message === "Zapisano zmiany",
    setField,
    saveAccount,
  };
}
