import "server-only";
import { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";
import { assertGraphQlSuccess, parseJsonResponse } from "@/lib/graphql-response";
import { graphqlBody, type TypedDocumentNode, type Envelope } from "@/packages/commerce/woocommerce/graphql";
import { CommerceError } from "@/packages/commerce/core/errors";
export async function publicQuery<T, V>(document: TypedDocumentNode<T, V>, variables: NoInfer<V>, revalidate = 60): Promise<T> {
  const response = await fetch(WORDPRESS_GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: graphqlBody(document, variables), next: { revalidate }, signal: AbortSignal.timeout(20000) });
  const payload = await parseJsonResponse<Envelope<T>>(response, "Public store query");
  assertGraphQlSuccess(payload);
  if (!payload.data) throw new CommerceError("response", "Missing backend data");
  return payload.data;
}
