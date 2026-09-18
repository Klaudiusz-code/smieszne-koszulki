import "server-only";
import type { Input, Output, StorePath } from "@/lib/api/contracts";
import { createWordPressStore } from "./wordpress/store";
import { createSession } from "./wordpress/session";
export type StoreServices = { [P in StorePath]: (input: Input<P>) => Promise<Output<P>> };
/** Composition root: replace the provider here; HTTP and UI contracts stay unchanged. */
export async function createStoreServices() {
  const session = await createSession();
  return { services: createWordPressStore(session.transport), applyCookies: session.applyCookies };
}
