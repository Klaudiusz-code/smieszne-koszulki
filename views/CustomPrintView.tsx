"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import {
  PiTShirtLight,
  PiCoffeeLight,
  PiMagicWandLight,
  PiPlusLight,
  PiMinusLight,
} from "react-icons/pi";

// DOKŁADNIE TE SAME DANE CO NA STRONIE GŁÓWNEJ + rozszerzony opis
const steps = [
  {
    num: "01",
    title: "Napisz do nas z pomysłem",
    desc: "Opisz co chcesz wydrukować. Nie musisz mieć gotowego pliku graficznego – wystarczy szkic na kartce albo opis słowny.",
    detail:
      "W mailu podaj: przybliżoną ilość, rozmiary, kolor odzieży oraz termin, do którego potrzebujesz zamówienia.",
    color: "bg-black",
    textColor: "text-white",
  },
  {
    num: "02",
    title: "Projekt i wycena",
    desc: "Nasz grafik przygotowuje cyfrową wizualizację nałożoną na zdjęcie rzeczywistego produktu.",
    detail:
      "Wycena jest zawsze darmowa i niezobowiązująca. Dostosowujemy się do Twojego budżetu.",
    color: "bg-[#ddb745]",
    textColor: "text-black",
  },
  {
    num: "03",
    title: "Akceptacja i produkcja",
    desc: "Jak wszystko wygląda idealnie, dajesz zielone światło. Pobieramy płatność i przekazujemy zamówienie na drukarnię.",
    detail:
      "Używamy technologii DTG (Direct to Garment), która gwarantuje najwyższą trwałość i oddanie kolorów.",
    color: "bg-black",
    textColor: "text-white",
  },
  {
    num: "04",
    title: "Pakowanie i wysyłka",
    desc: "Pakujemy w estetyczne opakowania i wysyłamy kurierem. Od druku do Twoich drzwi mija zazwyczaj 24h.",
    detail:
      "Na każdą paczkę zakładamy paragon/fakturę oraz drobny upominek od naszej drużyny.",
    color: "bg-[#27ae60]",
    textColor: "text-white",
  },
];

const faqs = [
  {
    q: "Jakiego pliku graficznego potrzebujecie?",
    a: "Im wyższa jakość, tym lepiej (np. PNG, PDF, SVG), ale jeśli nie masz gotowego projektu – wyślij cokolwiek. Nasz grafik dopracuje szczegóły.",
  },
  {
    q: "Jaka jest minimalna wielkość zamówienia?",
    a: "Dla nadruków cyfrowych (DTG) nie ma minimum – możemy wydrukować nawet jedną sztukę. Przy powyżej 20 sztuk używamy sitodruku, co obniża cenę.",
  },
  {
    q: "Czy nadruk wyblaknie po praniu?",
    a: "Nie, jeśli dbasz o odzież zaleceniom (pranie na lewej stronie, 30 stopni). Technologia DTG wtłacza farbę w strukturę bawełny.",
  },
  {
    q: "Ile to kosztuje?",
    a: "Cena zależy od metody i ilości. Koszulka z jednym nadrukiem zaczyna się od 49 zł. Wycenę zawsze dostajesz bezpłatnie przed decyzją.",
  },
];

export default function WlasnyNadrukPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumb items={[{ label: "Własny nadruk" }]} />

      {/* HERO */}
      <div className="grid lg:grid-cols-2 gap-16 items-center mb-28">
        <div>
          <p className="text-xs font-medium text-[#ddb745] uppercase tracking-widest mb-4">
            Usługa premium
          </p>
          <h1 className="text-4xl md:text-5xl font-medium text-black tracking-tight leading-tight mb-6">
            Twój projekt, <br />
            nasza technologia.
          </h1>
          <p className="text-stone-500 text-base font-light leading-relaxed max-w-lg mb-8">
            Nie musisz być grafikiem, żeby stworzyć własną koszulkę. Opisz nam
            swój pomysł, a my poprowadzimy Cię przez cały proces – od szkicu po
            bezpieczną dostawę pod drzwi.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#27ae60] transition-colors duration-300"
          >
            Zapytaj o wycenę
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="relative h-[400px] lg:h-[500px]">
          <div className="absolute inset-4 bg-stone-100 rounded-3xl -z-10" />
          <div className="relative h-full w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100">
            <Image
              src="/koszulka1.jpg"
              alt="Z Projektowanie nadruku"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm text-black text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-stone-200/50">
              Krok po kroku
            </div>
          </div>
        </div>
      </div>

      {/* OŚ CZASU - ZIDENTYCZNA WIZUALNIE Z HOMEPAGE */}
      <div className="mb-28">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-[#ddb745] uppercase tracking-widest mb-3">
            Proces
          </p>
          <h2 className="text-3xl font-medium text-black tracking-tight">
            Jak wygląda współpraca?
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-12 relative">
          {/* Pionowa linia - GRADIENT ZGODNY Z HOMEPAGE */}
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-black via-[#ddb745] to-[#27ae60] opacity-20" />

          {steps.map((step) => (
            <div key={step.num} className="flex gap-8 relative">
              {/* KROK - IDENTYCZNY JAK NA HOMEPAGE */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold tracking-tight shrink-0 z-10 ${step.color} ${step.textColor} shadow-md`}
              >
                {step.num}
              </div>

              <div className="pb-2">
                <h3 className="text-lg font-medium text-black tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed mb-3">
                  {step.desc}
                </p>
                <p className="text-xs text-stone-400 leading-relaxed border-l-2 border-stone-100 pl-3">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NA CZYM DRUKUJEMY */}
      <div className="mb-28 bg-stone-50/50 rounded-3xl p-10 lg:p-14 border border-stone-100">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Materiały
          </p>
          <h2 className="text-3xl font-medium text-black tracking-tight">
            Na czym drukujemy?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              Icon: PiTShirtLight,
              name: "Koszulki",
              sub: "100% bawełna, 180g/m²",
            },
            {
              Icon: PiTShirtLight,
              name: "Bluzy",
              sub: "Bawełna/Poliester, 280g/m²",
            },
            {
              Icon: PiCoffeeLight,
              name: "Kubki",
              sub: "Ceramika premium, 330ml",
            },
            {
              Icon: PiMagicWandLight,
              name: "Inne",
              sub: "Torby, plakaty, etui",
            },
          ].map((item) => (
            <div key={item.name} className="text-center group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 mb-4 group-hover:border-[#ddb745] group-hover:text-[#ddb745] transition-colors duration-300">
                <item.Icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-black mb-1">
                {item.name}
              </h4>
              <p className="text-[11px] text-stone-400 font-light">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl font-medium text-black tracking-tight">
            Często zadawane pytania
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-stone-100 border-y border-stone-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-6">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="text-base font-medium text-black pr-8 group-hover:text-[#27ae60] transition-colors">
                  {faq.q}
                </span>
                <span className="text-stone-400 shrink-0">
                  {openFaq === i ? (
                    <PiMinusLight className="w-5 h-5" />
                  ) : (
                    <PiPlusLight className="w-5 h-5" />
                  )}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
              >
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#27ae60] rounded-full blur-[120px] opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#ddb745] rounded-full blur-[120px] opacity-10" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-4">
            Gotowy na własny nadruk?
          </h2>
          <p className="text-stone-400 text-sm font-light max-w-lg mx-auto mb-8 leading-relaxed">
            Wystarczy, że napiszesz do nas maila z ogólnym zarysem pomysłu. My
            wrócimy z wizualizacją i darmową wyceną w ciągu 24 godzin.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#27ae60] text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#219150] transition-colors shadow-lg shadow-[#27ae60]/20"
          >
            Napisz do nas
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
