export interface ProductPriceFields {
  type?: "simple" | "variable";
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
}

function normalizePriceRangeSeparator(priceHtml: string): string {
  return priceHtml.replace(/\s+-\s+/g, " &ndash; ");
}

export function getListingPriceHtml(product: ProductPriceFields): string | null {
  if (product.type === "variable") {
    const variablePrice = product.price ?? product.salePrice ?? product.regularPrice ?? null;
    return variablePrice ? normalizePriceRangeSeparator(variablePrice) : null;
  }

  const salePrice = product.salePrice;
  const regularPrice = product.regularPrice;

  if (salePrice && regularPrice && salePrice !== regularPrice) {
    return `<del>${regularPrice}</del> <ins>${salePrice}</ins>`;
  }

  const price = salePrice ?? regularPrice ?? product.price ?? null;
  return price ? normalizePriceRangeSeparator(price) : null;
}
