/**
 * Odpowiedzialność komponentu:
 * - zbiera dane i treść wiadomości kontaktowej,
 * - prezentuje walidację oraz stan wysyłania formularza,
 * - wyświetla informację o powodzeniu lub błędzie wysyłki.
 */
"use client";

import { Button } from "@/components/buttons/Button";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { ContactFormField } from "./ContactFormField";
import { useContactForm } from "./useContactForm";

export function ContactForm() {
  const {
    errorMessage,
    handleSubmit,
    hasError,
    isSending,
    isSent,
  } = useContactForm();

  if (isSent) {
    return (
      <div className="flex flex-col justify-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0EBE6]">
          <CheckIcon className="h-[22px] w-[22px] text-cd-brown" strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-semibold">Wiadomość wysłana</h2>
        <p className="text-[16px] leading-relaxed text-cd-brown/60">
          Dziękujemy za kontakt. Odpiszemy w ciągu jednego dnia roboczego.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ContactFormField
          id="name"
          name="name"
          label="Imię"
          placeholder="Anna"
          autoComplete="given-name"
          required
          maxLength={100}
        />
        <ContactFormField
          id="email"
          name="email"
          label="E-mail"
          type="email"
          placeholder="anna@przykład.pl"
          autoComplete="email"
          required
        />
      </div>

      <ContactFormField
        id="subject"
        name="subject"
        label="Temat"
        placeholder="Pytanie o zamówienie"
        maxLength={150}
      />

      <ContactFormField
        id="message"
        name="message"
        label="Wiadomość"
        placeholder="Cześć! Chciałam zapytać…"
        required
        maxLength={5000}
        multiline
      />

      {hasError ? (
        <p role="alert" className="text-[14px] text-[#9b3a2f]">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          variant="primary"
          size="form"
          loading={isSending}
          loadingLabel="Wysyłanie…"
          className="rounded-full bg-black px-12 py-4 text-[15px] tracking-wide hover:bg-[#27ae60]"
        >
          Wyślij wiadomość
        </Button>
      </div>
    </form>
  );
}
