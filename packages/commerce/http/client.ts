import { CommerceError } from "../core/errors";
import type { Endpoint } from "./contracts";
export type ApiErrorCode = "validation" | "unauthorized" | "forbidden" | "unavailable" | "rate_limit" | "upstream" | "not_found";
export class ApiError extends CommerceError {
  constructor(public readonly apiCode: ApiErrorCode, message: string, public readonly status: number) {
    super(apiCode === "validation" ? "validation" : "transport", message);
  }
}
export function createApiClient(options: { baseUrl?: string; fetch?: typeof fetch; onUnauthorized?: () => void } = {}) {
  return async function request<I, O>(path: string, contract: Endpoint<I, O>, input: I): Promise<O> {
    let body: string;
    try { body = JSON.stringify(contract.input.parse(input)); }
    catch { throw new ApiError("validation", "Nieprawidłowe dane żądania.", 0); }
    let response: Response;
    try {
      response = await (options.fetch ?? fetch)(`${options.baseUrl ?? "/api/store"}/${path}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin", cache: "no-store", body,
      });
    } catch (cause) { throw new CommerceError("transport", "Nie udało się połączyć ze sklepem. Sprawdź wynik operacji przed ponowną próbą.", { cause }); }
    if (response.status === 401) options.onUnauthorized?.();
    let payload;
    try { payload = await response.json(); } catch { throw new CommerceError("response", "Nieprawidłowa odpowiedź sklepu."); }
    if (!response.ok) {
      const error = payload?.error;
      const codes: ApiErrorCode[] = ["validation", "unauthorized", "forbidden", "unavailable", "rate_limit", "upstream", "not_found"];
      if (error && codes.includes(error.code) && typeof error.message === "string") throw new ApiError(error.code, error.message, response.status);
      throw new CommerceError("response", "Nieprawidłowa odpowiedź sklepu.");
    }
    try { return contract.output.parse(payload.data); }
    catch (cause) { throw new CommerceError("response", "Niekompletna odpowiedź sklepu.", { cause }); }
  };
}
