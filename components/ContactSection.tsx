import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="kontakt" className="relative overflow-hidden bg-white px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-5 text-4xl font-black tracking-tight md:text-6xl">
            Masz pomysł na produkt?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Koszulki, bluzy, kubki i gadżety z własnym tekstem lub grafiką.
          </p>
        </div>

        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gray-900 p-10 text-white shadow-2xl md:p-14">
          <div className="relative z-10 max-w-2xl">
            <h3 className="mb-4 text-2xl font-bold md:text-4xl">
              Stwórz własny produkt
            </h3>
            <p className="mb-8 max-w-lg text-gray-400">
              Wybierz gotowy wzór albo zaprojektuj coś swojego. Realizujemy
              też nietypowe pomysły.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/produkty"
                className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-gray-900 transition hover:bg-gray-100"
              >
                Przejdź do sklepu
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex justify-center rounded-xl border-2 border-gray-700 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-gray-900"
              >
                Personalizacja
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-gray-700 opacity-20" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <h3 className="mb-2 text-xl font-bold">Masz pytanie?</h3>
            <p className="mb-4 text-sm text-gray-500">
              Nie wiesz jaki produkt wybrać albo jak przygotować projekt?
            </p>
            <Link
              href="/kontakt"
              className="border-b-2 border-transparent pb-0.5 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:border-black hover:text-black"
            >
              Skontaktuj się →
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <h3 className="mb-2 text-xl font-bold">Dla firm i eventów</h3>
            <p className="mb-4 text-sm text-gray-500">
              Koszulki z logo, gadżety reklamowe, większe zamówienia.
            </p>
            <Link
              href="/kontakt"
              className="border-b-2 border-transparent pb-0.5 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:border-black hover:text-black"
            >
              Zapytaj o ofertę →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
