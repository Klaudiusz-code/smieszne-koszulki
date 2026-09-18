import { CommerceError } from "../core/errors";

function getBodySnippet(body: string, maxLength = 180) {
  const normalized = body.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

export function getGraphQlErrorSummary(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("errors" in payload)) {
    return null;
  }

  const errors = (payload as { errors?: unknown }).errors;

  if (!Array.isArray(errors)) {
    return null;
  }

  const messages = errors
    .map((error) => {
      if (!error || typeof error !== "object" || !("message" in error)) {
        return null;
      }

      const message = (error as { message?: unknown }).message;
      return typeof message === "string" ? message.trim() : null;
    })
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join("; ") : null;
}

/** Używaj dla operacji wymagających pełnego sukcesu, bez zmiany obsługi odczytów częściowych. */
export function assertGraphQlSuccess(payload: unknown): void {
  const message = getGraphQlErrorSummary(payload);
  const errors = payload && typeof payload === "object" && "errors" in payload ? payload.errors : null;
  if (Array.isArray(errors) && errors.length) throw new CommerceError("graphql", message || "GraphQL request failed");
}

function getResponseSourceLabel(response: Response) {
  const server = response.headers.get("server");

  try {
    const url = new URL(response.url);
    return server ? `${url.host} via ${server}` : url.host;
  } catch {
    return server ?? "unknown host";
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected error.";
}

export async function parseJsonResponse<T>(response: Response, requestLabel: string, { logGraphQlErrors = true } = {}): Promise<T> {
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "unknown";
  const statusLabel = `${response.status} ${response.statusText || "Unknown Status"}`;
  const sourceLabel = getResponseSourceLabel(response);

  if (!body.trim()) {
    throw new Error(`${requestLabel} returned an empty response from ${sourceLabel} (${statusLabel}).`);
  }

  let payload: T;

  try {
    payload = JSON.parse(body) as T;
  } catch {
    throw new Error(
      `${requestLabel} returned non-JSON content from ${sourceLabel} (${statusLabel}, ${contentType}): ${getBodySnippet(body)}`,
    );
  }

  if (!response.ok) {
    const summary = getGraphQlErrorSummary(payload) ?? getBodySnippet(body);
    throw new Error(`${requestLabel} failed on ${sourceLabel} (${statusLabel}): ${summary}`);
  }

  const gqlErrorSummary = getGraphQlErrorSummary(payload);
  if (gqlErrorSummary && logGraphQlErrors) {
    console.error(`\x1b[41m\x1b[97m [GQL ERROR] \x1b[0m\x1b[31m ${requestLabel} (${sourceLabel}): ${gqlErrorSummary}\x1b[0m`);
  }

  return payload;
}
