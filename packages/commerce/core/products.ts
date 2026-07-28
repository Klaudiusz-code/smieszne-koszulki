import type { CommerceAdapter, ProductFilters, ProductPage } from "./models";
import { createResource } from "./resource";

export function appendUniqueProducts<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const seen = new Set(current.map((product) => product.id));
  return [...current, ...incoming.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  })];
}

export function createProductListing(adapter: Pick<CommerceAdapter, "products">, filters: ProductFilters, initial: ProductPage) {
  let page = initial;
  const resource = createResource(async () => page, undefined, initial);
  return {
    resource,
    async loadMore() {
      if (resource.getSnapshot().action || !page.hasNextPage || !page.endCursor) return;
      if (resource.getSnapshot().error) await resource.refresh();
      await resource.mutate("loadMore", async () => {
        const next = await adapter.products(filters, page.endCursor);
        page = { ...next, products: appendUniqueProducts(page.products, next.products) };
      });
    },
  };
}
