import "server-only";
import { NextRequest } from "next/server";
import { guardJsonMutation, getClientIp, rateLimit } from "@/lib/api-security";
import { endpoints, type StorePath } from "@/lib/api/contracts";
import type { Endpoint } from "@/packages/commerce/http/contracts";
import { ServiceError } from "./errors";
import { apiJson, apiFailure } from "./http";
import { createStoreServices } from "./store";

const validationPaths = new Set(["cart/add", "cart/remove", "cart/quantity", "checkout/address", "checkout/shipping", "checkout/coupons/apply", "checkout/coupons/remove", "products/review", "account/update", "account/address"]);
export async function storeHandler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!Object.hasOwn(endpoints, path)) return apiFailure(new ServiceError("not_found", "Nie znaleziono operacji.", 404));
  const guard = guardJsonMutation(req);
  if (guard) return apiFailure(new ServiceError("forbidden", "Nieprawidłowe źródło lub format żądania.", guard.status));
  const limit = rateLimit({ key: `store:ip:${getClientIp(req)}`, limit: 120, windowMs: 60000 });
  if (limit) { const response = apiFailure(new ServiceError("rate_limit", "Za dużo prób. Spróbuj ponownie później.", 429)); response.headers.set("Retry-After", limit.headers.get("Retry-After")!); return response; }
  const contract = endpoints[path as StorePath] as Endpoint<unknown, unknown>;
  let input: unknown;
  try {
    if (Number(req.headers.get("content-length")) > 16384) throw new ServiceError("validation", "Żądanie jest za duże.", 413);
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 16384) throw new ServiceError("validation", "Żądanie jest za duże.", 413);
    input = contract.input.parse(JSON.parse(text));
  } catch (error) { return apiFailure(error instanceof ServiceError ? error : new ServiceError("validation", "Nieprawidłowe dane żądania.", 400)); }
  let store: Awaited<ReturnType<typeof createStoreServices>> | undefined;
  try {
    store = await createStoreServices();
    const service = store.services[path as StorePath] as (input: unknown) => Promise<unknown>;
    const result = await service(input);
    return store.applyCookies(apiJson({ data: contract.output.parse(result) }));
  } catch (error) {
    const response = apiFailure(error, validationPaths.has(path));
    return store ? store.applyCookies(response) : response;
  }
}
