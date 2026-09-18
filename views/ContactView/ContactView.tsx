"use client";

import { useState, type FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";

type ContactStatus = "idle" | "sending" | "sent" | "error";

export function ContactView() {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
      };

      if (response.ok && data.status === "ok") {
        setStatus("sent");
        return;
      }

      setError(data.error || "Nie udało się wysłać wiadomości.");
      setStatus("error");
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumb items={[{ label: "Kontakt" }]} />

      <div className="mb-16 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#ddb745]">
          Napisz do nas
        </p>
        <h1 className="text-4xl font-medium leading-tight tracking-tight text-black md:text-5xl">
          Masz pomysł, pytanie <br />
          lub potrzebujesz wyceny?
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-stone-500">
          Wypełnij formularz, a odpowiemy w ciągu kilku godzin w dni robocze.
          Możesz też napisać do nas bezpośrednio na maila.
        </p>
      </div>

      <div className="grid gap-16 pb-24 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {status === "sent" ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/50 py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#27ae60]/10">
                <svg
                  className="h-8 w-8 text-[#27ae60]"
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
              <h2 className="mb-2 text-2xl font-medium tracking-tight text-black">
                Wiadomość wysłana
              </h2>
              <p className="max-w-sm text-sm text-stone-400">
                Dziękujemy za kontakt. Odezwiemy się do Ciebie najszybciej jak
                to możliwe.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-8 border-b border-stone-200 pb-0.5 text-xs uppercase tracking-widest text-stone-500 transition-colors hover:border-black hover:text-black"
              >
                Wyślij kolejną wiadomość
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-xs font-medium uppercase tracking-widest text-stone-500"
                  >
                    Imię i nazwisko
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Jan Kowalski"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-black transition-all placeholder:text-stone-300 focus:border-[#ddb745] focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-medium uppercase tracking-widest text-stone-500"
                  >
                    Adres e-mail
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="jan@example.com"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-black transition-all placeholder:text-stone-300 focus:border-[#ddb745] focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-xs font-medium uppercase tracking-widest text-stone-500"
                >
                  Temat
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  className="w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-black transition-all focus:border-[#ddb745] focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Wybierz temat zapytania
                  </option>
                  <option>Zamówienie własnego nadruku</option>
                  <option>Zapytanie o ofertę dla firm (B2B)</option>
                  <option>Status istniejącego zamówienia</option>
                  <option>Reklamacja lub zwrot</option>
                  <option>Inne</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-xs font-medium uppercase tracking-widest text-stone-500"
                >
                  Wiadomość
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Opisz swój pomysł, podaj ilość, rozmiary lub zadaj pytanie..."
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-black transition-all placeholder:text-stone-300 focus:border-[#ddb745] focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50"
                />
              </div>

              {status === "error" ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-12 py-4 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-[#27ae60] disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
                >
                  {status === "sending" ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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

        <div className="space-y-10 lg:col-span-2">
          <div>
            <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-stone-500">
              Dane kontaktowe
            </h2>
            <div className="space-y-6">
              <a
                href="mailto:kontakt@smiesznekoszulki.pl"
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[#27ae60]/20 group-hover:text-[#27ae60]">
                  <HiOutlineEnvelope className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs uppercase tracking-widest text-stone-400">
                    E-mail
                  </p>
                  <p className="text-sm font-medium text-black underline-offset-4 group-hover:underline">
                    kontakt@smiesznekoszulki.pl
                  </p>
                </div>
              </a>

              <a
                href="tel:+48123456789"
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[#27ae60]/20 group-hover:text-[#27ae60]">
                  <HiOutlinePhone className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs uppercase tracking-widest text-stone-400">
                    Telefon
                  </p>
                  <p className="text-sm font-medium text-black underline-offset-4 group-hover:underline">
                    +48 123 456 789
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400">
                  <HiOutlineMapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs uppercase tracking-widest text-stone-400">
                    Lokalizacja
                  </p>
                  <p className="text-sm font-medium text-black">Zamość, Polska</p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    Wysyłamy paczki w całą Polsce.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-8">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-stone-500">
              Godziny pracy
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-light text-stone-500">Poniedziałek - Piątek</span>
                <span className="font-medium text-black">8:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-light text-stone-500">Sobota</span>
                <span className="font-medium text-stone-400">Nie pracujemy</span>
              </div>
              <div className="flex justify-between">
                <span className="font-light text-stone-500">Niedziela</span>
                <span className="font-medium text-stone-400">Nie pracujemy</span>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-stone-100 bg-stone-50 p-6">
            <p className="mb-4 text-sm font-light leading-relaxed text-stone-600">
              Wolisz napisać bezpośrednio z poczty? Kliknij przycisk poniżej, a
              otwarte zostanie okno Twojego klienta mailowego z przygotowanym
              tematem.
            </p>
            <a
              href="mailto:kontakt@smiesznekoszulki.pl?subject=Zapytanie ze strony internetowej"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-xs font-medium tracking-wide text-black transition-colors hover:border-black"
            >
              <HiOutlineEnvelope className="h-4 w-4" />
              Otwórz aplikację pocztową
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
