import { print } from "graphql";
import { CommerceError } from "../core/errors";
import type { TypedDocumentNode, ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
export type { TypedDocumentNode, ResultOf, VariablesOf };
export interface Envelope<T> { data?: T | null; errors?: { message?: string }[] }
/** Typed serialization is the only place documents become strings for HTTP. */
export function graphqlBody<T, V>(document: TypedDocumentNode<T, V>, variables: NoInfer<V>) {
  return JSON.stringify({ query: print(document), variables });
}
export function required<T>(value: T | null | undefined, field: string): T {
  if (value == null) throw new CommerceError("response", `Missing ${field}`);
  return value;
}
