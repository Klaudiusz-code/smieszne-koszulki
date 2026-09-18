import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { NextRequest } from "next/server";
import {
  WORDPRESS_GRAPHQL_URL,
  getClientIp,
  guardJsonMutation,
  hasNoControlCharacters,
  hasOnlySafeLoginCharacters,
  isSafeResetKey,
  privateJson,
  rateLimit,
} from "@/lib/api-security";
import { getErrorMessage, parseJsonResponse } from "@/lib/graphql-response";
import { ResetUserPasswordDocument as RESET_USER_PASSWORD_MUTATION } from "@/lib/server/wordpress/generated";

type ResetUserPasswordResponse = Envelope<ResultOf<typeof RESET_USER_PASSWORD_MUTATION>>;

export async function POST(req: NextRequest) {
  if (!ACCOUNT_FEATURES_ENABLED) return privateJson({ error: "Konto klienta jest obecnie niedostępne." }, { status: 503 });
  const guard = guardJsonMutation(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipLimit = rateLimit({
    key: `wp-set-password:ip:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (ipLimit) return ipLimit;

  const body = await req.json().catch(() => ({}));
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!key || !login || !password) {
    return privateJson({ error: "Brakuje wymaganych danych." }, { status: 400 });
  }

  if (
    !isSafeResetKey(key) ||
    login.length > 100 ||
    !hasNoControlCharacters(login) ||
    !hasOnlySafeLoginCharacters(login)
  ) {
    return privateJson({ error: "Nieprawidłowy link resetowania hasła." }, { status: 400 });
  }

  if (password.length < 12) {
    return privateJson({ error: "Hasło powinno mieć co najmniej 12 znaków." }, { status: 400 });
  }

  if (password.length > 1024) {
    return privateJson({ error: "Hasło jest zbyt długie." }, { status: 400 });
  }

  const accountLimit = rateLimit({
    key: `wp-set-password:account:${login.toLowerCase()}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (accountLimit) return accountLimit;

  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: graphqlBody(RESET_USER_PASSWORD_MUTATION, { key, login, password }),
  });

  let data: ResetUserPasswordResponse;

  try {
    data = await parseJsonResponse<ResetUserPasswordResponse>(res, "ResetUserPassword request");
  } catch (error) {
    return privateJson(
      { error: getErrorMessage(error) },
      { status: res.status >= 400 ? res.status : 502 },
    );
  }

  const errors = data?.errors;
  if (errors?.length) {
    return privateJson(
      { error: errors[0].message || "Nie udało się zresetować hasła." },
      { status: 400 },
    );
  }

  if (!data?.data?.resetUserPassword?.user) {
    return privateJson({ error: "Nieprawidłowy lub wygasły link resetowania hasła." }, { status: 400 });
  }

  return privateJson({ status: "ok" });
}
