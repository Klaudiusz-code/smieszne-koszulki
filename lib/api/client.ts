import { createApiClient } from "@/packages/commerce/http";
import type { Endpoint } from "@/packages/commerce/http/contracts";
import { endpoints, type Input, type Output, type StorePath } from "./contracts";
export const apiRequest = createApiClient({ onUnauthorized() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("store:session-expired"));
} });
export function storeApi<P extends StorePath>(path: P, input: Input<P>): Promise<Output<P>> {
  return apiRequest(path, endpoints[path] as Endpoint<Input<P>, Output<P>>, input);
}
