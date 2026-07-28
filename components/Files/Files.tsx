/** Renderuje listę plików cyfrowych dostępnych do pobrania przez klienta. */
"use client";

import { useCustomerDownloadableItems } from "./useCustomerDownloadableItems";

function FilesLoadingState() {
  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div className="animate-pulse space-y-5">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-[#eaded7]" />
          <div className="h-4 w-full max-w-md rounded bg-[#f3ebe6]" />
        </div>

        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#eaded7]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Files() {
  const { items, error } = useCustomerDownloadableItems();

  if (error) return <p role="alert">{error}</p>;

  if (!items) {
    return <FilesLoadingState />;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Pliki do pobrania</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
            Tutaj pojawia sie lista wszystkich plikow przypisanych do Twoich zakupow.
          </p>
        </div>

        <p className="mt-8 text-[#7d625a]">Brak plikow do pobrania.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#eaded7] bg-white p-6 shadow-[0_12px_32px_rgba(78,52,46,0.08)] sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-cd-brown sm:text-2xl">Pliki do pobrania</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d625a]">
          Pobierzesz tutaj zakupione materialy i sprawdzisz limity oraz daty wygasniecia dostepu.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#eaded7] bg-cd-cream p-4"
          >
            <div>
              <p className="font-medium text-cd-brown">{item.name}</p>
              {item.product?.name && (
                <p className="text-sm text-[#7d625a]">{item.product.name}</p>
              )}
              <div className="mt-1 flex gap-4 text-xs text-[#8f6f65]">
                {item.accessExpires && (
                  <span>
                    Wygasa: {new Date(item.accessExpires).toLocaleDateString("pl-PL")}
                  </span>
                )}
                {item.downloadsRemaining != null && (
                  <span>Pozostalo pobran: {item.downloadsRemaining}</span>
                )}
              </div>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-cd-brown px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#102d20]"
            >
              Pobierz
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
