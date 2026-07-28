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
import { RegisterCustomerDocument as REGISTER_CUSTOMER_MUTATION } from "@/lib/server/wordpress/generated";

type RegisterResponse = Envelope<ResultOf<typeof REGISTER_CUSTOMER_MUTATION>>;

export async function POST(req: NextRequest) {
  if (!ACCOUNT_FEATURES_ENABLED) return privateJson({ error: "Konto klienta jest obecnie niedostępne." }, { status: 503 });
  const guard = guardJsonMutation(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipLimit = rateLimit({
    key: `wp-register:ip:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (ipLimit) return ipLimit;

  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !email || !password) {
    return privateJson({ error: "Uzupełnij login, e-mail i hasło." }, { status: 400 });
  }

  if (
    username.length < 3 ||
    username.length > 60 ||
    !hasOnlySafeLoginCharacters(username) ||
    !hasNoControlCharacters(username)
  ) {
    return privateJson({ error: "Login może zawierać litery, cyfry, kropki, myślniki i podkreślenia." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return privateJson({ error: "Podaj poprawny adres e-mail." }, { status: 400 });
  }

  if (password.length < 12) {
    return privateJson({ error: "Hasło powinno mieć co najmniej 12 znaków." }, { status: 400 });
  }

  if (password.length > 1024) {
    return privateJson({ error: "Hasło jest zbyt długie." }, { status: 400 });
  }

  const emailLimit = rateLimit({
    key: `wp-register:email:${email.toLowerCase()}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (emailLimit) return emailLimit;

  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: graphqlBody(REGISTER_CUSTOMER_MUTATION, { username, email, password }),
  });

  let data: RegisterResponse;

  try {
    data = await parseJsonResponse<RegisterResponse>(res, "Registration request");
  } catch (error) {
    return privateJson(
      { error: getErrorMessage(error) },
      { status: res.status >= 400 ? res.status : 502 },
    );
  }

  const authToken = data?.data?.registerCustomer?.authToken;
  const refreshToken = data?.data?.registerCustomer?.refreshToken;
  const registration = data.data?.registerCustomer;
  const errorMessage =
    data?.errors?.[0]?.message || "Nie udało się utworzyć konta.";

  if (!authToken || !refreshToken || !registration) {
    return privateJson({ error: errorMessage }, { status: 400 });
  }

  const response = privateJson({
    status: "ok",
    customer: registration.customer,
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

  response.cookies.set("wp_user_name", registration.customer?.username || username, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
