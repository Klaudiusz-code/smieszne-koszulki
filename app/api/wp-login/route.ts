import { graphqlBody, type Envelope, type ResultOf } from "@/packages/commerce/woocommerce/graphql";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { NextRequest } from "next/server";
import {
  COOKIE_SECURE,
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
import { LoginDocument as LOGIN_MUTATION } from "@/lib/server/wordpress/generated";

type LoginResponse = Envelope<ResultOf<typeof LOGIN_MUTATION>>;

const INVALID_CREDENTIALS_MESSAGE = "Nieprawidłowy login, e-mail lub hasło.";

export async function POST(req: NextRequest) {
  if (!ACCOUNT_FEATURES_ENABLED) return privateJson({ error: "Konto klienta jest obecnie niedostępne." }, { status: 503 });
  const guard = guardJsonMutation(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipLimit = rateLimit({
    key: `wp-login:ip:${ip}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (ipLimit) return ipLimit;

  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return privateJson({ error: "Podaj login lub e-mail oraz hasło." }, { status: 400 });
  }

  if (
    username.length > 100 ||
    password.length > 1024 ||
    !hasNoControlCharacters(username) ||
    (!isEmail(username) && !hasOnlySafeLoginCharacters(username))
  ) {
    return privateJson({ error: "Nieprawidłowy login lub e-mail." }, { status: 400 });
  }

  const accountLimit = rateLimit({
    key: `wp-login:account:${username.toLowerCase()}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (accountLimit) return accountLimit;

  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: graphqlBody(LOGIN_MUTATION, { username, password }),
  });

  let data: LoginResponse;

  try {
    data = await parseJsonResponse<LoginResponse>(res, "Login request");
  } catch (error) {
    return privateJson(
      { error: getErrorMessage(error) },
      { status: res.status >= 400 ? res.status : 502 },
    );
  }

  const authToken = data?.data?.login?.authToken;
  const refreshToken = data?.data?.login?.refreshToken;
  const login = data.data?.login;

  if (!authToken || !refreshToken || !login) {
    return privateJson({ error: INVALID_CREDENTIALS_MESSAGE }, { status: 401 });
  }

  const userName = login.user?.name || username;

  const response = privateJson({
    status: "ok",
    user: login.user,
  });

  response.cookies.set("wp_token", authToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set("wp_refresh_token", refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("wp_user_name", userName, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
