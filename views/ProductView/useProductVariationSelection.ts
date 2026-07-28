/**
 * Odpowiedzialność hooka:
 * - wybiera początkowo najtańszy dostępny wariant produktu,
 * - utrzymuje wybór wartości poszczególnych atrybutów,
 * - dopasowuje pełną selekcję do konkretnego wariantu produktu.
 */
import { useState } from "react";

interface ProductVariationAttribute {
  name: string;
  options: string[];
}

interface ProductVariation {
  price?: string | null;
  stockStatus?: string | null;
  attributes: { name: string; value: string }[];
}

interface ProductWithVariations<TVariation extends ProductVariation> {
  variations?: TVariation[];
}

function parseVariationPrice(priceHtml?: string | null): number {
  if (!priceHtml) {
    return Infinity;
  }

  const text = priceHtml.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  const match = text.match(/[\d\s]+[,.]\d+/);
  if (!match) {
    return Infinity;
  }

  return parseFloat(match[0].replace(/\s/g, "").replace(",", "."));
}

function getInitialSelection<TVariation extends ProductVariation>({
  product,
  variantAttrs,
  isVariable,
}: {
  product: ProductWithVariations<TVariation>;
  variantAttrs: ProductVariationAttribute[];
  isVariable: boolean;
}) {
  const preselected: Record<string, string> = {};

  if (isVariable && product.variations && product.variations.length > 0) {
    const variations = product.variations;
    const inStock = variations.filter((variation) => variation.stockStatus !== "OUT_OF_STOCK");
    const candidates = inStock.length > 0 ? inStock : variations;
    const cheapest = candidates.reduce((min, variation) => (
      parseVariationPrice(variation.price) < parseVariationPrice(min.price) ? variation : min
    ));

    for (const attr of cheapest.attributes) {
      preselected[attr.name] = attr.value;
    }
  } else {
    for (const attr of variantAttrs) {
      if (attr.options.length === 1) {
        preselected[attr.name] = attr.options[0];
      }
    }
  }

  return preselected;
}

export function useProductVariationSelection<TVariation extends ProductVariation>({
  product,
  variantAttrs,
  isVariable,
}: {
  product: ProductWithVariations<TVariation>;
  variantAttrs: ProductVariationAttribute[];
  isVariable: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    getInitialSelection({ product, variantAttrs, isVariable }),
  );

  const allSelected = variantAttrs.every((attr) => selected[attr.name]);
  const matchedVariation =
    product.variations && allSelected
      ? product.variations.find((variation) =>
        variation.attributes.every((attr) => selected[attr.name] === attr.value),
      ) ?? null
      : null;

  return { selected, setSelected, matchedVariation };
}
