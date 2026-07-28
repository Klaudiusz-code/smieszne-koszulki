import { VerifySessionDocument } from "@/lib/server/wordpress/generated";
import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { parseJsonResponse } from "@/lib/graphql-response";
import { cookies } from "next/headers";
import { privateJson } from "@/lib/api-security";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { clearAuthCookies, resolveAuth, writeAuthCookie } from "@/lib/wordpress-auth";
import { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";

export async function GET() {
  if (!ACCOUNT_FEATURES_ENABLED) return privateJson({ logged_in: false });
  const store = await cookies();
  try {
    const auth = await resolveAuth(store.get("wp_token")?.value, store.get("wp_refresh_token")?.value);
    if (!auth.token) return clearAuthCookies(privateJson({ logged_in: false }));
    const result = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
      body: graphqlBody(VerifySessionDocument, {}),
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) {
      if (result.status === 401 || result.status === 403) return clearAuthCookies(privateJson({ logged_in: false }));
      throw new Error("Backend unavailable");
    }
    const data = await parseJsonResponse<Envelope<ResultOf<typeof VerifySessionDocument>>>(result, "Verify session", { logGraphQlErrors: false });
    if (!data.data?.viewer?.databaseId) {
      if (data.errors?.length && !data.errors.some((error: { message?: string }) => /jwt|token|authentication/i.test(error.message ?? ""))) throw new Error("Session query failed");
      return clearAuthCookies(privateJson({ logged_in: false }));
    }
    const response = privateJson({ logged_in: true, user_name: data.data.viewer.name });
    if (auth.renewed) writeAuthCookie(response, auth.token);
    return response;
  } catch {
    return privateJson({ error: "Nie udało się potwierdzić sesji." }, { status: 503 });
  }
}
