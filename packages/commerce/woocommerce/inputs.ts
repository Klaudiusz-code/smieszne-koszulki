import { CountriesEnumValues, ProductTaxonomyEnumValues, type CustomerAddressInput, type ProductTaxonomyFilterInput } from "./generated";
import type { CheckoutAddress, TaxonomyFilter } from "../core/models";
import { CommerceError } from "../core/errors";
function enumValue<T extends string>(values: readonly T[], input: string): T {
  const value = values.find((candidate) => candidate === input);
  if (!value) throw new CommerceError("validation", "Nieprawidłowa wartość pola.");
  return value;
}
export function addressInput(address: Partial<CheckoutAddress> | null): CustomerAddressInput | null {
  if (!address) return null;
  return { ...address, country: address.country ? enumValue(CountriesEnumValues, address.country) : undefined };
}
export function taxonomyInput(filters: TaxonomyFilter[]): ProductTaxonomyFilterInput[] {
  return filters.map((filter) => ({ ...filter, taxonomy: enumValue(ProductTaxonomyEnumValues, filter.taxonomy) }));
}
