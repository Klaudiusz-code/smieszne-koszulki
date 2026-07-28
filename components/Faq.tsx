"use client";

import { useState } from "react";

const faqs = [
  {
    q: "W jakim formacie wysłać własną grafikę?",
    a: "Najlepiej w formacie wektorowym (PDF, AI, SVG) lub jako plik PNG w wysokiej rozdzielczości (min. 300 DPI) z przezroczystym tłem. Jeśli nie wiesz jak to zrobić – wyślij to co masz, our grafik dopracuje szczegóły.",
  },
  {
    q: "Czy nadruk schodzi w pralce?",
    a: "Nie, jeśli odpowiednio o niego dbasz. Zalecamy pranie na lewej stronie w temperaturze do 30°C i prasowanie po niewidocznej stronie (nie bezpośrednio po nadruku). Techniki, których używamy (DTF/DTG), są bardzo trwałe.",
  },
  {
    q: "Jaki jest minimalny nakład?",
    a: "Nie mamy minimalnego nakładu. Możesz zamówić u nas dosłownie jedną sztukę z własnym nadrukiem. W przypadku zamówień hurtowych (powyżej 50 sztuk) przygotowujemy indywidualną wycenę.",
  },
  {
    q: "Ile czekam na realizację?",
    a: "Standardowy czas realizacji od momentu akceptacji projektu to 1-2 dni robocze. W sezonie (np. przed świętami) może to zająć do 3-4 dni roboczych. Wysyłka kurierem to kolejne 24h.",
  },
  {
    q: "Czy mogę zwrócić produkt z własnym nadrukiem?",
    a: "Produkty personalizowane (z Twoim unikalnym projektem lub imieniem) nie podlegają zwrotowi, o ile nie są wadliwe. Gotowe projekty z naszego sklepu można zwrócić w ciągu 14 dni.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 px-6 bg-[#f9f8f6]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <p className="text-xs font-semibold text-[#ddb745] uppercase tracking-widest mb-4">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Masz pytania?
          </h2>
          <p className="text-stone-500 mt-4 text-sm leading-relaxed max-w-lg">
            Zbieramy najczęstsze wątpliwości. Nie znalazłeś odpowiedzi? Napisz
            do nas.
          </p>
        </div>

        <div className="divide-y divide-stone-200 border-t border-stone-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="text-base font-medium text-black tracking-tight pr-8 group-hover:text-[#ddb745] transition-colors">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center transition-all duration-300 ${openIndex === index ? "bg-black border-black text-white rotate-45" : "text-stone-400"}`}
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
              >
                <p className="text-sm text-stone-500 leading-relaxed font-light">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
