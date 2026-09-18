/**
 * Odpowiedzialność komponentu:
 * - prezentuje zapisane adresy rozliczeniowy i wysyłkowy klienta,
 * - udostępnia formularze edycji adresów,
 * - obsługuje stany ładowania, zapisu i błędów.
 */
"use client";

import { Button } from "@/components/buttons/Button";
import {
  EMPTY_CUSTOMER_ADDRESS,
  useCustomerAddressForm,
  useCustomerAddresses,
  type CustomerAddress,
  type CustomerAddressField,
} from "./useCustomerAddresses";

const BILLING_FIELDS: CustomerAddressField[] = [
  { key: "firstName", label: "Imie" },
  { key: "lastName", label: "Nazwisko" },
  { key: "company", label: "Firma" },
  { key: "address1", label: "Adres" },
  { key: "address2", label: "Adres cd." },
  { key: "city", label: "Miasto" },
  { key: "postcode", label: "Kod pocztowy" },
  { key: "country", label: "Kraj" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-mail" },
];

const SHIPPING_FIELDS = BILLING_FIELDS.filter((f) => f.key !== "email");

function AddressesLoadingState() {
  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-7 w-36 rounded bg-[#eaded7]" />
          <div className="h-4 w-full max-w-lg rounded bg-[#f3ebe6]" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-[#eaded7] bg-cd-cream p-5">
              <div className="space-y-3">
                <div className="h-6 w-40 rounded bg-[#eaded7]" />
                <div className="h-4 w-full max-w-xs rounded bg-[#f3ebe6]" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3, 4, 5].map((field) => (
                  <div key={field} className={field >= 2 ? "sm:col-span-2" : ""}>
                    <div className="h-4 w-24 rounded bg-[#f3ebe6]" />
                    <div className="mt-2 h-11 rounded-xl bg-[#eaded7]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Addresses() {
  const { billing, shipping, loading, error, setBilling, setShipping } = useCustomerAddresses();

  if (error) return <p role="alert">{error}</p>;

  if (loading) {
    return <AddressesLoadingState />;
  }

  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Adresy</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
          Zapisz dane do faktury i wysylki, aby szybciej przechodzic przez checkout.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <AddressForm
          title="Adres do faktury"
          description="Dane wykorzystywane przy rozliczeniu i na dokumentach zamowienia."
          address={billing ?? EMPTY_CUSTOMER_ADDRESS}
          fields={BILLING_FIELDS}
          mutationName="billing"
          onSaved={setBilling}
        />
        <AddressForm
          title="Adres do wysylki"
          description="Adres, pod ktory kierowane beda zamowienia wymagajace dostawy."
          address={shipping ?? EMPTY_CUSTOMER_ADDRESS}
          fields={SHIPPING_FIELDS}
          mutationName="shipping"
          onSaved={setShipping}
        />
      </div>
    </section>
  );
}

function AddressForm({
  title,
  description,
  address,
  fields,
  mutationName,
  onSaved,
}: {
  title: string;
  description: string;
  address: CustomerAddress;
  fields: CustomerAddressField[];
  mutationName: "billing" | "shipping";
  onSaved: (address: CustomerAddress) => void;
}) {
  const { form, saving, message, success, setField, saveAddress } = useCustomerAddressForm({
    address,
    fields,
    mutationName,
    onSaved,
  });

  return (
    <section className="rounded-2xl border border-[#eaded7] bg-cd-cream p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cd-brown">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#7d625a]">{description}</p>
        </div>

        {message ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className={
              f.key === "address1" ||
              f.key === "address2" ||
              f.key === "email" ||
              f.key === "company"
                ? "sm:col-span-2"
                : undefined
            }
          >
            <label className="mb-2 block text-sm font-medium text-cd-brown">{f.label}</label>
            <input
              type={f.key === "email" ? "email" : "text"}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              autoComplete="off"
              className="w-full rounded-xl border border-[#eaded7] bg-white px-4 py-3 text-sm text-cd-brown transition-colors focus:border-cd-gold focus:outline-none"
            />
          </div>
        ))}

        <div className="pt-2 sm:col-span-2">
          <Button
            variant="primary"
            size="form"
            onClick={saveAddress}
            loading={saving}
            loadingLabel="Zapisywanie..."
          >
            Zapisz adres
          </Button>
        </div>
      </div>
    </section>
  );
}
