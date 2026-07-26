"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";

export default function KontaktPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    setTimeout(() => {
      setStatus("sent");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumb items={[{ label: "Kontakt" }]} />

      {/* Nagłówek */}
      <div className="mb-16 max-w-2xl">
        <p className="text-xs font-medium text-[#ddb745] uppercase tracking-widest mb-3">
          Napisz do nas
        </p>
        <h1 className="text-4xl md:text-5xl font-medium text-black tracking-tight leading-tight">
          Masz pomysł, pytanie <br />
          lub potrzebujesz wyceny?
        </h1>
        <p className="text-stone-500 text-sm font-light leading-relaxed mt-4">
          Wypełnij formularz, a odpowiemy w ciągu kilku godzin w dni robocze.
          Możesz też napisać do nas bezpośrednio na maila.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-16 pb-24">
        <div className="lg:col-span-3">
          {status === "sent" ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-stone-50/50 rounded-2xl border border-stone-100">
              <div className="w-16 h-16 rounded-full bg-[#27ae60]/10 flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-[#27ae60]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-black tracking-tight mb-2">
                Wiadomość wysłana
              </h2>
              <p className="text-stone-400 text-sm max-w-sm">
                Dziękujemy za kontakt. Odezwiemy się do Ciebie najszybciej jak
                to możliwe.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-8 text-xs text-stone-500 hover:text-black uppercase tracking-widest border-b border-stone-200 hover:border-black pb-0.5 transition-colors"
              >
                Wyślij kolejną wiadomość
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-widest block mb-2">
                    Imię i nazwisko
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Jan Kowalski"
                    className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50 focus:border-[#ddb745] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-widest block mb-2">
                    Adres e-mail
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="jan@example.com"
                    className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50 focus:border-[#ddb745] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-widest block mb-2">
                  Temat
                </label>
                <select
                  required
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50 focus:border-[#ddb745] transition-all appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Wybierz temat zapytania
                  </option>
                  <option>Zamówienie własnego nadruku</option>
                  <option>Zapytanie o ofertę dla firm (B2B)</option>
                  <option>Status existing zamówienia</option>
                  <option>Reklamacja lub zwrot</option>
                  <option>Inne</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-widest block mb-2">
                  Wiadomość
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Opisz swój pomysł, podaj ilość, rozmiary lub zadaj pytanie..."
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50 focus:border-[#ddb745] transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full sm:w-auto px-12 py-4 bg-black text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#27ae60] transition-all duration-300 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Wysyłanie...
                    </>
                  ) : (
                    "Wyślij wiadomość"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div>
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-6">
              Dane kontaktowe
            </h3>
            <div className="space-y-6">
              <a
                href="mailto:kontakt@smiesznekoszulki.pl"
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 group-hover:text-[#27ae60] group-hover:border-[#27ae60]/20 transition-colors shrink-0">
                  <HiOutlineEnvelope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">
                    E-mail
                  </p>
                  <p className="text-sm font-medium text-black group-hover:underline underline-offset-4">
                    kontakt@smiesznekoszulki.pl
                  </p>
                </div>
              </a>

              <a
                href="tel:+48123456789"
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 group-hover:text-[#27ae60] group-hover:border-[#27ae60]/20 transition-colors shrink-0">
                  <HiOutlinePhone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">
                    Telefon
                  </p>
                  <p className="text-sm font-medium text-black group-hover:underline underline-offset-4">
                    +48 123 456 789
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <HiOutlineMapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">
                    Lokalizacja
                  </p>
                  <p className="text-sm font-medium text-black">
                    Zamość, Polska
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Wysyłamy paczki w całą Polsce.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-6">
              Godziny pracy
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">
                  Poniedziałek - Piątek
                </span>
                <span className="text-black font-medium">8:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">Sobota</span>
                <span className="text-stone-400 font-medium">Niepracujemy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">Niedziela</span>
                <span className="text-stone-400 font-medium">Niepracujemy</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border mt-2 border-stone-100">
            <p className="text-sm text-stone-600 font-light leading-relaxed mb-4">
              Wolisz napisać bezpośrednio z poczty? Kliknij przycisk poniżej, a
              otwarte zostanie okno Twojego klienta mailowego z przygotowanym
              tematem.
            </p>
            <a
              href="mailto:kontakt@smiesznekoszulki.pl?subject=Zapytanie ze strony internetowej"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-black text-xs font-medium tracking-wide rounded-full hover:border-black transition-colors"
            >
              <HiOutlineEnvelope className="w-4 h-4" />
              Otwórz aplikację pocztową
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
