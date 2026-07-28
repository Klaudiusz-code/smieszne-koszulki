import { NextRequest } from "next/server";
import { COOKIE_SECURE, privateJson, requireSameOrigin } from "@/lib/api-security";

export async function POST(req: NextRequest) {
  const guard = requireSameOrigin(req);
  if (guard) return guard;

  const response = privateJson({ status: "wylogowano" });

  response.cookies.set("wp_token", "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("wp_refresh_token", "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("wp_user_name", "", {
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("wc_session", "", { httpOnly: true, secure: COOKIE_SECURE, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
