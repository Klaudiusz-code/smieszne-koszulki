/**
 * Odpowiedzialność komponentu:
 * - prezentuje dane konta zalogowanego klienta,
 * - umożliwia edycję danych osobowych i kontaktowych,
 * - obsługuje stany pobierania oraz zapisywania zmian.
 */
"use client";

import { Button } from "@/components/buttons/Button";
import { useCustomerAccountDetails } from "./useCustomerAccountDetails";

function AccountLoadingState() {
  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div className="animate-pulse space-y-5">
        <div className="space-y-3">
          <div className="h-7 w-44 rounded bg-[#eaded7]" />
          <div className="h-4 w-full max-w-md rounded bg-[#f3ebe6]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={i >= 2 ? "sm:col-span-2" : ""}>
              <div className="h-4 w-28 rounded bg-[#f3ebe6]" />
              <div className="mt-2 h-11 rounded-xl bg-[#eaded7]" />
            </div>
          ))}
        </div>

        <div className="h-11 w-36 rounded-xl bg-[#eaded7]" />
      </div>
    </section>
  );
}

export default function Details() {
  const { form, loading, saving, message, success, setField, saveAccount } = useCustomerAccountDetails();

  if (loading) {
    return <AccountLoadingState />;
  }

  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Szczegóły konta</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
            Uzupełnij podstawowe dane widoczne przy zamówieniach i w panelu klienta.
          </p>
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Imię" value={form.firstName} onChange={(v) => setField("firstName", v)} />
        <Field label="Nazwisko" value={form.lastName} onChange={(v) => setField("lastName", v)} />
        <Field
          label="Nazwa wyświetlana"
          value={form.displayName}
          onChange={(v) => setField("displayName", v)}
          className="sm:col-span-2"
        />
        <Field
          label="E-mail"
          value={form.email}
          type="email"
          onChange={(v) => setField("email", v)}
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          size="form"
          onClick={saveAccount}
          loading={saving}
          loadingLabel="Zapisywanie..."
        >
          Zapisz zmiany
        </Button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-cd-brown">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#eaded7] bg-[#fffaf7] px-4 py-3 text-sm text-cd-brown transition-colors focus:border-cd-gold focus:outline-none"
      />
    </div>
  );
}
