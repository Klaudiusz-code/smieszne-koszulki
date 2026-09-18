export type CommerceErrorCode = "validation" | "transport" | "response" | "graphql" | "busy" | "stale" | "storage" | "pending";

/** Codes belong to the library; customer-facing messages belong to the application. */
export class CommerceError extends Error {
  constructor(public readonly code: CommerceErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CommerceError";
  }
}

export function commerceError(cause: unknown): CommerceError {
  return cause instanceof CommerceError ? cause : new CommerceError("transport", "Commerce request failed", { cause });
}
