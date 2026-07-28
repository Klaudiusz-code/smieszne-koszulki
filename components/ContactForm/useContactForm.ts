/**
 * Odpowiedzialność hooka:
 * - buduje dane formularza kontaktowego,
 * - wysyła wiadomość do endpointu kontaktowego,
 * - udostępnia stany wysyłania, powodzenia i błędu.
 */
"use client";

import { useState, type FormEvent } from "react";

type ContactFormStatus = "idle" | "sending" | "sent" | "error";

interface ContactFormResponse {
  status?: string;
  error?: string;
}

const SEND_ERROR = "Nie udało się wysłać wiadomości.";
const CONNECTION_ERROR = "Błąd połączenia. Spróbuj ponownie.";

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function useContactForm() {
  const [status, setStatus] = useState<ContactFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: readField(formData, "name"),
      email: readField(formData, "email"),
      subject: readField(formData, "subject"),
      message: readField(formData, "message"),
    };

    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as ContactFormResponse;

      if (response.ok && data.status === "ok") {
        setStatus("sent");
        return;
      }

      setErrorMessage(data.error || SEND_ERROR);
      setStatus("error");
    } catch {
      setErrorMessage(CONNECTION_ERROR);
      setStatus("error");
    }
  }

  return {
    errorMessage,
    handleSubmit,
    isSending: status === "sending",
    isSent: status === "sent",
    hasError: status === "error",
  };
}
