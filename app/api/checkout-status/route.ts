import { CheckoutSupportDocument } from "@/lib/server/wordpress/generated";
import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { parseJsonResponse } from "@/lib/graphql-response";
import { privateJson } from "@/lib/api-security";
import { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";

export async function GET() {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: graphqlBody(CheckoutSupportDocument, {}),
      next: { revalidate: 60 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Backend unavailable");
    const payload = await parseJsonResponse<Envelope<ResultOf<typeof CheckoutSupportDocument>>>(response, "Checkout support");
    return privateJson({ available: Boolean(!payload.errors?.length && payload.data?.mutation && payload.data?.result && payload.data?.receipt && payload.data?.payment) });
  } catch {
    return privateJson({ available: false }, { status: 503 });
  }
}
