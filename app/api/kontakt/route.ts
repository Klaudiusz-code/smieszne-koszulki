import { NextRequest } from "next/server";
import {
  getClientIp,
  guardJsonMutation,
  hasNoControlCharacters,
  hasNoUnsafeTextControlCharacters,
  isEmail,
  privateJson,
  rateLimit,
} from "@/lib/api-security";

import { CONTACT_FORMS_URL } from "@/lib/wordpress-config";
const CONTACT_FORM_ID = process.env.WORDPRESS_CONTACT_FORM_ID?.trim() ?? "";

export async function POST(req: NextRequest) {
  if (!/^\d+$/.test(CONTACT_FORM_ID)) {
    return privateJson(
      { error: "Formularz kontaktowy wymaga konfiguracji po stronie sklepu." },
      { status: 503 },
    );
  }

  const guard = guardJsonMutation(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const limit = rateLimit({
    key: `kontakt:ip:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (limit) return limit;

  const body = await req.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return privateJson({ error: "Wypełnij wszystkie wymagane pola." }, { status: 400 });
  }

  if (
    name.length > 100 ||
    subject.length > 150 ||
    message.length > 5000 ||
    !hasNoControlCharacters(name) ||
    !hasNoControlCharacters(subject) ||
    !hasNoUnsafeTextControlCharacters(message)
  ) {
    return privateJson({ error: "Wiadomość zawiera nieprawidłowe dane." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return privateJson({ error: "Podaj poprawny adres e-mail." }, { status: 400 });
  }

  const form = new FormData();
  form.append("_wpcf7", CONTACT_FORM_ID);
  form.append("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-p0-o1`);
  form.append("_wpcf7_container_post", "0");
  form.append("your-name", name);
  form.append("your-email", email);
  form.append("your-subject", subject);
  form.append("your-message", message);

  const endpoint = `${CONTACT_FORMS_URL}${CONTACT_FORM_ID}/feedback`;
  const res = await fetch(endpoint, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (data.status === "mail_sent") {
    return privateJson({ status: "ok" });
  }

  const error = data.message || "Nie udało się wysłać wiadomości. Spróbuj ponownie.";
  return privateJson({ error }, { status: 422 });
}
