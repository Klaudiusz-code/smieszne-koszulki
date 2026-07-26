import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="kontakt" className="relative overflow-hidden bg-white py-24 px-6">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Masz pomysł na produkt?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Koszulki, bluzy, kubki i gadżety z własnym tekstem lub grafiką.
          </p>
        </div>

        <div className="bg-gray-900 text-white rounded-3xl p-10 md:p-14 shadow-2xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl md:text-4xl font-bold mb-4">
              Stwórz własny produkt
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg">
              Wybierz gotowy wzór albo zaprojektuj coś swojego. Realizujemy
              też nietypowe pomysły.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sklep"
                className="inline-flex justify-center px-8 py-3.5 bg-white text-gray-900 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-100 transition"
              >
                Przejdź do sklepu
              </Link>
              <a
                href="mailto:kontakt@smiesznekoszulki.pl"
                className="inline-flex justify-center px-8 py-3.5 border-2 border-gray-700 text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white hover:text-gray-900 transition"
              >
                Personalizacja
              </a>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gray-700 rounded-full opacity-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <h3 className="text-xl font-bold mb-2">Masz pytanie?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Nie wiesz jaki produkt wybrać albo jak przygotować projekt?
            </p>
            <a
              href="mailto:kontakt@smiesznekoszulki.pl"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black pb-0.5 transition"
            >
              Skontaktuj się →
            </a>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <h3 className="text-xl font-bold mb-2">Dla firm i eventów</h3>
            <p className="text-sm text-gray-500 mb-4">
              Koszulki z logo, gadżety reklamowe, większe zamówienia.
            </p>
            <a
              href="mailto:kontakt@smiesznekoszulki.pl"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black pb-0.5 transition"
            >
              Zapytaj o ofertę →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}