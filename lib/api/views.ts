import * as s from "@/packages/commerce/http/schema";
import { product as productCard, productPage, filters } from "@/packages/commerce/http/contracts";
import { card } from "./contracts";
import type { ProductData } from "@/types/product";
const maybeText = s.optional(s.nullable(s.string));
const image = s.object({ sourceUrl: s.string, altText: maybeText, thumbnailUrl: maybeText, lightboxUrl: maybeText });
const prices = { price: s.optional(s.string), regularPrice: maybeText, salePrice: maybeText, sku: maybeText, stockStatus: maybeText, stockQuantity: s.optional(s.nullable(s.number)) };
const attribute = s.object({ name: s.string, label: s.string, options: s.array(s.string), variation: s.boolean, terms: s.array(s.object({ slug: s.string, name: s.string })) });
export const productDetails: s.Schema<ProductData> = s.object({ type: s.oneOf(["simple", "variable"]), databaseId: s.integer(1), slug: s.string, name: s.string, description: s.string, shortDescription: s.string,
  image: s.nullable(image), galleryImages: s.array(image), categories: s.array(s.object({ databaseId: s.integer(1), name: s.string, slug: s.string })),
  ...prices, onSale: s.optional(s.nullable(s.boolean)), averageRating: s.optional(s.nullable(s.number)), attributes: s.array(attribute),
  variations: s.array(s.object({ ...prices, price: s.string, databaseId: s.integer(1), name: s.string, image: s.nullable(image), attributes: s.array(s.object({ name: s.string, value: s.string })) })),
  reviewCount: s.optional(s.integer()), reviewsAllowed: s.optional(s.nullable(s.boolean)), reviews: s.array(s.object({ author: s.string, date: s.string, content: s.string, rating: s.optional(s.nullable(s.number)) })) });
export const category = s.object({ databaseId: s.integer(1), name: s.string, slug: s.string, description: s.nullable(s.string) });
export const content = s.object({ type: s.oneOf(["page", "post"]), title: s.string, content: s.string, excerpt: maybeText, date: maybeText, modified: maybeText, author: maybeText, image: s.optional(s.nullable(image)) });
export const homeView = s.object({ products: s.array(productCard) });
export const productView = s.object({ product: s.nullable(productDetails), matchedByDatabaseId: s.boolean, similarProducts: s.array(card) });
export const shopView = s.object({ initial: productPage, filters, attrTerms: s.record(s.array(s.object({ name: s.string, slug: s.string, count: s.nullable(s.number) }))), category: s.nullable(category), selectedCategory: s.string });
export type HomeViewData = s.Infer<typeof homeView>;
export type ProductViewData = s.Infer<typeof productView>;
export type ShopViewData = s.Infer<typeof shopView>;
export type ContentViewData = s.Infer<typeof content>;
export type CategoryData = s.Infer<typeof category>;
export type ViewParams = Record<string, string | string[] | undefined>;
