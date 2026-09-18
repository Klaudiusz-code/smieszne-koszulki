export interface ProductImage {
  sourceUrl: string;
  thumbnailUrl?: string | null;
  lightboxUrl?: string | null;
  altText?: string | null;
}

export interface ProductAttributeValue {
  name: string;
  value: string;
}

export interface ProductVariation {
  databaseId: number;
  name: string;
  price: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  sku?: string | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  attributes: ProductAttributeValue[];
  image: ProductImage | null;
}

export interface ProductAttribute {
  name: string;
  label: string;
  options: string[];
  variation: boolean;
  terms: { slug: string; name: string }[];
}

export interface ProductReview {
  author: string;
  date: string;
  content: string;
  rating?: number | null;
  isLocal?: boolean;
  isPending?: boolean;
}

export interface SimilarProduct {
  type?: "simple" | "variable";
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText?: string | null } | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
}

export interface ProductData {
  type: "simple" | "variable";
  databaseId: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  image: ProductImage | null;
  galleryImages: ProductImage[];
  categories: { databaseId: number; name: string; slug: string }[];
  averageRating?: number | null;
  price?: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
  sku?: string | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  reviewCount?: number;
  reviewsAllowed?: boolean | null;
  reviews: ProductReview[];
}
