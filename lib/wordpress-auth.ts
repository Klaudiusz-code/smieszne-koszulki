import { NextResponse } from "next/server";
import { COOKIE_SECURE } from "./api-security";
import { WORDPRESS_GRAPHQL_URL } from "./wordpress-config";
import { RefreshAuthTokenDocument } from "@/lib/server/wordpress/generated";
import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { parseJsonResponse } from "@/lib/graphql-response";

// Daty są wyłącznie wskazówką odświeżania; podpis i uprawnienia sprawdza WordPress.
function tokenTimes(token?: string) {
  try {
    const data = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
    if (!Number.isFinite(data.exp) || !Number.isFinite(data.iat)) return null;
    return { exp: Number(data.exp), iat: Number(data.iat) };
  } catch { return null; }
}

export async function resolveAuth(token?: string, refresh?: string) {
  const now = Date.now() / 1000;
  const times = tokenTimes(token);
  if (times && times.exp > now && now < (times.exp + times.iat) / 2) return { token, renewed: false };
  if (refresh) {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: graphqlBody(RefreshAuthTokenDocument, { refreshToken: refresh }), cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Nie można teraz odświeżyć sesji.");
    const payload = await parseJsonResponse<Envelope<ResultOf<typeof RefreshAuthTokenDocument>>>(response, "Refresh session", { logGraphQlErrors: false });
    const renewed = payload.data?.refreshJwtAuthToken?.authToken;
    if (typeof renewed === "string" && !payload.errors?.length) return { token: renewed, renewed: true };
  }
  return { token: times && times.exp > now ? token : undefined, renewed: false };
}

export function writeAuthCookie(response: NextResponse, token: string) {
  const times = tokenTimes(token);
  response.cookies.set("wp_token", token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: "lax", path: "/", maxAge: Math.max(0, (times?.exp ?? Date.now() / 1000) - Math.floor(Date.now() / 1000)) });
}

export function clearAuthCookies(response: NextResponse) {
  for (const name of ["wp_token", "wp_refresh_token", "wp_user_name"]) {
    response.cookies.set(name, "", { httpOnly: name !== "wp_user_name", secure: COOKIE_SECURE, sameSite: "lax", path: "/", maxAge: 0 });
  }
  return response;
}
