import { NextRequest, NextResponse } from "next/server";
import { PRIVATE_REVALIDATING_CACHE_CONTROL } from "@/lib/http-cache";

export { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";

const DEFAULT_SITE_URL = "https://zabawnekoszulki.pl";
const RATE_LIMIT_CLEANUP_INTERVAL = 100;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

declare global {
  var __cdRateLimitBuckets: Map<string, RateLimitBucket> | undefined;
  var __cdRateLimitChecks: number | undefined;
}

export const COOKIE_SECURE = process.env.NODE_ENV === "production";

export function privateJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", PRIVATE_REVALIDATING_CACHE_CONTROL);

  return response;
}

export function requireSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const candidate = origin || referer;

  if (!candidate) {
    return process.env.NODE_ENV === "production"
      ? privateJson({ error: "Nieprawidłowe źródło żądania." }, { status: 403 })
      : null;
  }

  if (!isAllowedOrigin(candidate)) {
    return privateJson({ error: "Nieprawidłowe źródło żądania." }, { status: 403 });
  }

  return null;
}

export function requireJsonContent(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return privateJson({ error: "Wymagany Content-Type: application/json." }, { status: 415 });
  }

  return null;
}

export function guardJsonMutation(req: NextRequest) {
  return requireSameOrigin(req) || requireJsonContent(req);
}

export function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

export function rateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const buckets = getRateLimitBuckets(now);
  const bucket = buckets.get(options.key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  bucket.count += 1;

  if (bucket.count > options.limit) {
    const response = privateJson(
      { error: options.message || "Za dużo prób. Spróbuj ponownie później." },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));

    return response;
  }

  return null;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function hasOnlySafeLoginCharacters(value: string) {
  return /^[A-Za-z0-9_.@-]+$/.test(value);
}

export function hasNoControlCharacters(value: string) {
  return !/[\u0000-\u001f\u007f]/.test(value);
}

export function hasNoUnsafeTextControlCharacters(value: string) {
  return !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

export function isSafeResetKey(value: string) {
  return /^[A-Za-z0-9_-]{10,128}$/.test(value);
}

function getAllowedOrigins() {
  const configured = [
    process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
    DEFAULT_SITE_URL,
    "https://zabawnekoszulki.pl",
    "https://beta.zabawnekoszulki.pl",
    ...(process.env.ALLOWED_ORIGINS || "").split(","),
  ];

  if (process.env.NODE_ENV !== "production") {
    configured.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return new Set(
    configured
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        try {
          return new URL(value).origin;
        } catch {
          return null;
        }
      })
      .filter((value): value is string => Boolean(value)),
  );
}

function isAllowedOrigin(value: string) {
  try {
    return getAllowedOrigins().has(new URL(value).origin);
  } catch {
    return false;
  }
}

function getRateLimitBuckets(now: number) {
  const buckets = globalThis.__cdRateLimitBuckets ?? new Map<string, RateLimitBucket>();
  globalThis.__cdRateLimitBuckets = buckets;
  globalThis.__cdRateLimitChecks = (globalThis.__cdRateLimitChecks ?? 0) + 1;

  if (globalThis.__cdRateLimitChecks % RATE_LIMIT_CLEANUP_INTERVAL === 0) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  return buckets;
}
