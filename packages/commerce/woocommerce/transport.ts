import { assertGraphQlSuccess, parseJsonResponse } from "./response";

/** Same-origin operation proxy; raw GraphQL documents and auth tokens never enter its body. */
export function createProxyTransport<Operation extends string>({
  endpoint, fetcher = fetch, onUnauthorized,
}: { endpoint: string; fetcher?: typeof fetch; onUnauthorized?: () => void }) {
  async function send<T>(operationName: Operation, variables: Record<string, unknown> | undefined, logGraphQlErrors: boolean): Promise<T> {
    const response = await fetcher(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ operationName, variables }),
    });
    if (response.status === 401) onUnauthorized?.();
    return parseJsonResponse<T>(response, "GraphQL API request", { logGraphQlErrors });
  }
  return {
    request<T>(operationName: Operation, variables?: Record<string, unknown>): Promise<T> {
      return send<T>(operationName, variables, true);
    },
    async strict<T>(operationName: Operation, variables?: Record<string, unknown>): Promise<T> {
      // Strict callers handle the rejection in the UI; avoid a duplicate console error overlay.
      const result = await send<T>(operationName, variables, false);
      assertGraphQlSuccess(result);
      return result;
    },
  };
}
