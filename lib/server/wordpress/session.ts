import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { COOKIE_SECURE } from "@/lib/api-security";
import { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { GRAPHQL_ALLOWLIST, type GqlOperation, type OperationResult, type OperationVariables } from "./documents";
import { print } from "graphql";
import { type Envelope } from "@/packages/commerce/woocommerce/graphql";
import { assertGraphQlSuccess, parseJsonResponse } from "@/lib/graphql-response";
import { enrichProductImagesInGraphqlResponse } from "@/lib/product-image-fallback";
import { clearAuthCookies, resolveAuth, writeAuthCookie } from "@/lib/wordpress-auth";
import { ServiceError } from "../errors";

/** One instance per incoming request; never share customer credentials globally. */
export async function createSession() {
  const jar = await cookies();
  let session = jar.get("wc_session")?.value;
  let rotated: string | null = null;
  let auth: Awaited<ReturnType<typeof resolveAuth>> | undefined;
  let clearAuth = false;
  async function authenticate(account: boolean) {
    if (account && !ACCOUNT_FEATURES_ENABLED) throw new ServiceError("unavailable", "Konto klienta jest obecnie niedostępne.", 503);
    if (!auth) {
      const token = ACCOUNT_FEATURES_ENABLED ? jar.get("wp_token")?.value : undefined;
      const refresh = ACCOUNT_FEATURES_ENABLED ? jar.get("wp_refresh_token")?.value : undefined;
      try { auth = await resolveAuth(token, refresh); }
      catch { throw new ServiceError("unavailable", "Nie udało się odświeżyć sesji.", 503); }
      if ((token || refresh) && !auth.token) clearAuth = true;
    }
    if (clearAuth || (account && !auth.token)) throw new ServiceError("unauthorized", "Sesja wygasła. Zaloguj się ponownie.", 401);
  }
  return {
    async transport<K extends GqlOperation>(operation: K, variables: OperationVariables<K>): Promise<Envelope<OperationResult<K>>> {
      const account = /^(Customer|UpdateAccount|UpdateBillingAddress|UpdateShippingAddress)/.test(operation);
      await authenticate(account);
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
      else if (session) headers["woocommerce-session"] = `Session ${session}`;
      const response = await fetch(WORDPRESS_GRAPHQL_URL, { method: "POST", headers,
        body: JSON.stringify({ query: print(GRAPHQL_ALLOWLIST[operation]), variables }), cache: "no-store",
        signal: AbortSignal.timeout(operation === "PlaceOrder" ? 60000 : 20000) });
      // Propagate a rotated session even when parsing / validation fails afterwards.
      rotated = response.headers.get("woocommerce-session") || rotated;
      if (rotated) session = rotated;
      if (response.status === 401) { clearAuth = true; throw new ServiceError("unauthorized", "Sesja wygasła. Zaloguj się ponownie.", 401); }
      const payload = await parseJsonResponse<Envelope<OperationResult<K>>>(response, "Store backend", { logGraphQlErrors: false });
      assertGraphQlSuccess(payload);
      return await enrichProductImagesInGraphqlResponse(payload);
    },
    applyCookies(response: NextResponse) {
      if (auth?.renewed && auth.token) writeAuthCookie(response, auth.token);
      if (clearAuth) clearAuthCookies(response);
      if (rotated) response.cookies.set("wc_session", rotated, { httpOnly: true, secure: COOKIE_SECURE, sameSite: "lax", path: "/", maxAge: 172800 });
      return response;
    },
  };
}
