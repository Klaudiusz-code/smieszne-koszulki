import "server-only";
import { NextResponse } from "next/server";
import { CommerceError } from "@/packages/commerce/core/errors";
import { htmlToPlainText } from "@/lib/html-text";
import { ServiceError } from "./errors";

export function apiJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
}
export function apiFailure(error: unknown, acceptsValidation = false) {
  if (error instanceof ServiceError) return apiJson({ error: { code: error.code, message: error.message } }, error.status);
  if (acceptsValidation && error instanceof CommerceError && (error.code === "graphql" || error.code === "validation")) {
    return apiJson({ error: { code: "validation", message: htmlToPlainText(error.message) } }, 422);
  }
  return apiJson({ error: { code: "upstream", message: "Nie udało się potwierdzić danych sklepu. Odśwież dane lub sprawdź wynik operacji." } }, 502);
}
