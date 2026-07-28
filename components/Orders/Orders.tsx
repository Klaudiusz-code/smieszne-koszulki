/**
 * Odpowiedzialność komponentu:
 * - pobiera i prezentuje historię zamówień klienta,
 * - pokazuje status oraz najważniejsze dane każdego zamówienia,
 * - obsługuje stany ładowania, błędu i pustej listy.
 */
"use client";

import { useCustomerOrders } from "./useCustomerOrders";
import { sanitizePriceHtml } from "@/lib/sanitize-html";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Zrealizowane",
  PROCESSING: "W trakcie realizacji",
  ON_HOLD: "Wstrzymane",
  PENDING: "Oczekujace",
  CANCELLED: "Anulowane",
  REFUNDED: "Zwrocone",
  FAILED: "Nieudane",
};

function OrdersLoadingState() {
  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div className="animate-pulse space-y-5">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-[#eaded7]" />
          <div className="h-4 w-full max-w-md rounded bg-[#f3ebe6]" />
        </div>

        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-[#eaded7]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Orders() {
  const { orders, error } = useCustomerOrders();

  if (error) return <p role="alert">{error}</p>;

  if (!orders) {
    return <OrdersLoadingState />;
  }

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Zamówienia</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
            Tutaj pojawi się historia Twoich zakupów i aktualne statusy realizacji.
          </p>
        </div>

        <p className="mt-8 text-[#7d625a]">Nie masz jeszcze zadnych zamowien.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Zamówienia</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
          Sprawdzisz tutaj numer zamówienia, datę zakupu, status i listę kupionych produktów.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm text-cd-brown">
          <thead>
            <tr className="border-b border-[#eaded7] text-left text-[#7d625a]">
              <th className="pb-2 pr-4">Nr</th>
              <th className="pb-2 pr-4">Data</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Suma</th>
              <th className="pb-2">Produkty</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.databaseId} className="border-b border-[#f5f5f4]">
                <td className="py-3 pr-4 font-mono">#{order.orderNumber}</td>
                <td className="py-3 pr-4 text-[#7d625a]">
                  {new Date(order.date).toLocaleDateString("pl-PL")}
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full border border-[#eaded7] bg-cd-cream px-2.5 py-1 text-xs text-cd-brown">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-cd-brown" dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(order.total) }} />
                <td className="py-3 text-[#7d625a]">
                  {order.items.map((li, i) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      {li.name ?? "—"} x{li.quantity}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
