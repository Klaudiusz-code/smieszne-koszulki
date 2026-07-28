import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { NextRequest } from "next/server";
import {
  WORDPRESS_GRAPHQL_URL,
  getClientIp,
  guardJsonMutation,
  hasNoControlCharacters,
  hasOnlySafeLoginCharacters,
  isEmail,
  privateJson,
  rateLimit,
} from "@/lib/api-security";
import { getErrorMessage, parseJsonResponse } from "@/lib/graphql-response";
import { SendPasswordResetEmailDocument as SEND_PASSWORD_RESET_EMAIL_MUTATION } from "@/lib/server/wordpress/generated";

type SendPasswordResetResponse = Envelope<ResultOf<typeof SEND_PASSWORD_RESET_EMAIL_MUTATION>>;

export async function POST(req: NextRequest) {
  if (!ACCOUNT_FEATURES_ENABLED) return privateJson({ error: "Konto klienta jest obecnie niedostępne." }, { status: 503 });
  const guard = guardJsonMutation(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipLimit = rateLimit({
    key: `wp-reset-password:ip:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (ipLimit) return ipLimit;

  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";

  if (!username) {
    return privateJson({ error: "Podaj login lub e-mail." }, { status: 400 });
  }

  if (
    username.length > 100 ||
    !hasNoControlCharacters(username) ||
    (!isEmail(username) && !hasOnlySafeLoginCharacters(username))
  ) {
    return privateJson({ error: "Podaj poprawny login lub e-mail." }, { status: 400 });
  }

  const accountLimit = rateLimit({
    key: `wp-reset-password:account:${username.toLowerCase()}`,
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
    body: graphqlBody(SEND_PASSWORD_RESET_EMAIL_MUTATION, { username }),
  });

  try {
    await parseJsonResponse<SendPasswordResetResponse>(res, "SendPasswordResetEmail request");
  } catch (error) {
    return privateJson(
      { error: getErrorMessage(error) },
      { status: res.status >= 400 ? res.status : 502 },
    );
  }

  return privateJson({ status: "ok" });
}
