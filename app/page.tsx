import Image from "next/image";
import Link from "next/link";
import { FaRegSmile } from "react-icons/fa";

export const metadata = {
  title: "Śmieszne Koszulki - Sprzedaż koszulek, kubków | Zamość",
  description:
    "Profesjonala odzież w Zamościu. Koszulki, bluzy i gadżety z własnym nadrukiem. Znajdź nas w sklepie.",
  openGraph: {
    title: "Śmieszne Koszulki",
    description: "Koszulki i gadżety z najwyższej jakości nadrukiem.",
  },
};

const products = [
  { id: 1, name: "T-Shirt Classic", img: "/koszulka1.jpg", type: "MĘŻCZYNA" },
  { id: 2, name: "Mug Premium", img: "/kubek1.jpg", type: "GADŻET" },
  { id: 3, name: "Hoodie Heavy", img: "/koszulka3.jpg", type: "UNISEX" },
  { id: 4, name: "V-Neck Soft", img: "/koszulka2.jpg", type: "KOBIETA" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-yellow-200 selection:text-black">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* BUŹKA */}
            <div
              className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center
                      group-hover:bg-green-500 transition-colors duration-300"
            >
              <FaRegSmile className="text-black text-2xl group-hover:rotate-12 transition-transform duration-300" />
            </div>

            {/* TEKST */}
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight">
                <span className="text-green-600">Śmieszne</span>
                <span className="text-black">Koszulki</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">
                personalizowane nadruki
              </span>
            </div>
          </Link>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-600">
            <Link href="/sklep" className="hover:text-black transition-colors">
              Sklep
            </Link>
            <Link
              href="#jak-dziala"
              className="hover:text-green-600 transition-colors"
            >
              Jak to działa?
            </Link>
            <Link
              href="#kontakt"
              className="hover:text-green-600 transition-colors"
            >
              Kontakt
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="/sklep"
            className="hidden md:inline-flex items-center gap-2 px-8 py-3
                 bg-black text-white text-xs font-bold uppercase tracking-widest
                 hover:bg-green-500 hover:scale-105 transition-all duration-300 rounded-full"
          >
            Przejdź do sklepu
          </Link>
        </div>
      </nav>
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 bg-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-500">
                <div className="w-8 h-[1px] bg-yellow-500"></div>
                Dostawa w 24h
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.05]">
                Twój styl, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-600">
                  Twój uśmiech.
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-md font-medium leading-relaxed">
                Tworzymy koszulki z charakterem. Drukujemy Twoje projekty w
                Zamościu i wysyłamy w całą Polsce.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/sklep"
                  className="inline-flex justify-center items-center px-10 py-4 bg-green-600 text-white font-bold text-sm tracking-wide uppercase hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-500/30 rounded-full"
                >
                  Zobacz produkty
                </Link>

                <Link
                  href="#proces"
                  className="inline-flex justify-center items-center px-10 py-4 bg-white text-gray-900 border-2 border-yellow-400 font-bold text-sm tracking-wide uppercase hover:bg-yellow-400 transition-all duration-300 rounded-full"
                >
                  Własny projekt
                </Link>
              </div>

              <div className="pt-6 flex items-center gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  Wysyłka 24h
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Nie blaknie
                </div>
              </div>
            </div>

            <div className="relative h-[400px] md:h-[500px] group">
              <div className="absolute inset-0 bg-gray-100 rounded-3xl rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>

              <div className="relative h-full w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <Image
                  src="/koszulka1.jpg"
                  alt="Koszulka"
                  fill
                  priority
                  className="object-cover h-full w-full hover:scale-105 transition-transform duration-1000"
                />

                <div className="absolute bottom-8 right-8 bg-yellow-400 text-black px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg rotate-[-6deg] group-hover:rotate-0 transition-transform">
                  Nowość
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="proces"
        className="py-24 px-6 bg-gray-50 border-t border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Jak zamówić swój własny nadruk?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nie musisz obsługiwać sklepu. Jeśli masz swój pomysł, napisz do
              nas. My zajmiemy się techniką, wizualizacją i wysyłką.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-gray-200 z-0"></div>

            {[
              {
                num: "1",
                title: "Napisz do nas",
                desc: "Opisz swój pomysł lub prześlij grafik e-mailem.",
                color: "bg-gray-900",
              },
              {
                num: "2",
                title: "Wizualizacja",
                desc: "Przygotowujemy cyfrowy projekt i wysyłamy do akceptacji.",
                color: "bg-yellow-500",
              },
              {
                num: "3",
                title: "Wycena i druk",
                desc: "Akceptujesz, płacisz i my drukujemy.",
                color: "bg-gray-900",
              },
              {
                num: "4",
                title: "Dostawa",
                desc: "Odbierasz paczkę kurierem w 24h.",
                color: "bg-gray-900",
              },
            ].map((step, i) => (
              <div key={i} className="relative z-10 text-center md:text-left">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 text-white font-bold text-lg shadow-lg transform md:translate-x-0 md:ml-0 ${step.color}`}
                >
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="#kontakt"
              className="inline-block px-12 py-5 bg-gray-900 text-white font-bold text-sm tracking-widest uppercase rounded-full hover:bg-yellow-500 hover:text-black transition-colors shadow-xl"
            >
              Chcę zamówić własny projekt
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Najpierw ustalmy szczegóły, potem myślimy o płatności.
            </p>
          </div>
        </div>
      </section>

      <section id="oferta" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Najnowsze Propozycje
              </h2>
              <p className="text-gray-500 mt-2">
                Świeże projekty, które właśnie wpadły do magazynu.
              </p>
            </div>
            <Link
              href="/sklep"
              className="hidden md:block text-sm font-bold text-green-600 hover:text-green-800 transition-colors"
            >
              Zobacz całość &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-[4/5] bg-gray-50">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />

                    <div className="absolute top-4 left-4 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      Nowość
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        href="/sklep"
                        className="bg-white text-gray-900 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white transition-colors shadow-lg transform scale-90 group-hover:scale-100"
                      >
                        Zobacz
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        {product.name}
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {product.type}
                      </span>

                      <Link
                        href="/sklep"
                        className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-1 hover:text-green-800 transition-colors"
                      >
                        Szczegóły
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4-4m4 4l-4-4m-4 4l-4-4"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center md:hidden">
            <Link
              href="/sklep"
              className="inline-block w-full py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold uppercase hover:bg-gray-100 transition-colors"
            >
              Zobacz produkty
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Dlaczego my?</h2>
            <p className="text-gray-600">
              Dbamy o jakość i zadowolenie klienta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Jakość",
                desc: "Bawełna ringspun • Gramatura 180g/m² • Trwałe nadruki",
                icon: "🛡️",
              },
              {
                title: "Szybkość",
                desc: "Wysyłamy z Polski w 24h robocze • Bezpieczne paczki",
                icon: "⚡",
              },
              {
                title: "Wsparcie",
                desc: "Pomagamy dobrać materiał, rozmiar i technikę druku.",
                icon: "🤝",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Materiały, które naprawdę nosisz
              </h2>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed text-lg">
                Stawiamy na sprawdzone tkaniny i trwałe nadruki. Bez
                kompromisów, bez tanich zamienników.
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                Każdy produkt dobieramy pod wygodę, trwałość i codzienne
                użytkowanie.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm space-y-6 border border-gray-100">
              <div className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Koszulka klasyczna
                  </p>
                  <p className="text-sm text-gray-600">
                    Miękka, oddychająca, do codziennego noszenia
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    100% bawełna ringspun
                  </p>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                    180 g/m²
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Bluza premium
                  </p>
                  <p className="text-sm text-gray-600">
                    Gruba, ciepła, trzyma fason
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Bawełna / poliester
                  </p>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                    280 g/m²
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Kubek ceramiczny
                  </p>
                  <p className="text-sm text-gray-600">
                    Nadruk odporny na mycie
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Ceramika premium
                  </p>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    330 ml
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="kontakt"
        className="relative overflow-hidden bg-white py-24 px-6"
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Masz pomysł na produkt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Koszulki, bluzy, kubki i gadżety z własnym tekstem lub grafiką.
              Prosto, szybko i na luzie.
            </p>
          </div>

          <div className="bg-gray-900 text-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl mb-12 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6l4 2"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl md:text-5xl font-bold">
                  Stwórz własny produkt
                </h3>
              </div>

              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                Wybierz gotowy wzór albo zaprojektuj coś swojego. Realizujemy
                też nietypowe pomysły i personalizacje.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/sklep"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition"
                >
                  Przejdź do sklepu
                </a>
                <a
                  href="mailto:kontakt@smiesznekoszulki.pl"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-700 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white hover:text-gray-900 transition"
                >
                  Personalizacja
                </a>
              </div>
            </div>

            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gray-700 rounded-full opacity-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16h6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Masz pytanie?
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Nie wiesz jaki produkt wybrać albo jak przygotować projekt?
                Napisz do nas.
              </p>

              <a
                href="mailto:kontakt@smiesznekoszulki.pl"
                className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black border-b-2 border-transparent hover:border-black pb-1 transition"
              >
                Skontaktuj się →
              </a>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-6 0h-6a3 3 0 00-6 0v2h5"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Dla firm i eventów
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Koszulki z logo, gadżety reklamowe, większe zamówienia.
              </p>

              <a
                href="mailto:kontakt@smiesznekoszulki.pl"
                className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black border-b-2 border-transparent hover:border-black pb-1 transition"
              >
                Zapytaj o ofertę →
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-white pt-20 pb-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-black text-2xl text-gray-900">:)</span>
              <span className="font-black text-xl uppercase tracking-tighter">
                Śmieszne
                <span className="font-normal text-gray-400">Koszulki</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed text-sm">
              Profesjonalny druk odzieży. Realizujemy projekty własne oraz
              sprzedajemy gotowe wzory. Pierwszy sklep? Zrobimy to za Ciebie.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black hover:text-white transition"
              >
                FB
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black hover:text-white transition"
              >
                IG
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">
              Sklep
            </h5>
            <ul className="space-y-4 text-sm font-medium text-gray-600">
              <li>
                <Link href="/" className="hover:text-black transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sklep" className="hover:text-black transition">
                  Sklep
                </Link>
              </li>
              <li>
                <Link href="#oferta" className="hover:text-black transition">
                  Oferta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">
              Kontakt
            </h5>
            <ul className="space-y-4 text-sm font-medium text-gray-600">
              <li>Zamość, Polska</li>
              <li>kontakt@smiesznekoszulki.pl</li>
              <li>+48 123 456 789</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} Śmieszne Koszulki. Wszelkie prawa
            zastrzeżone.
          </p>

          <a
            href="https://klaudiuszdev.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 md:mt-0 hover:text-black transition-colors"
          >
            Designed by klaudiuszdev.pl
          </a>
        </div>
      </footer>
    </div>
  );
}
