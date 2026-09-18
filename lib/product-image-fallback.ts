import { parseJsonResponse } from "./graphql-response";

import { STORE_API_PRODUCTS_URL } from "./wordpress-config";
const STORE_API_PAGE_SIZE = 100;

type StoreApiImageSource = "full" | "thumbnail";

interface StoreApiProductImage {
  src?: string | null;
  thumbnail?: string | null;
  alt?: string | null;
}

interface StoreApiProduct {
  id?: number | null;
  images?: StoreApiProductImage[] | null;
}

export interface ProductImageLike {
  sourceUrl?: string | null;
  thumbnailUrl?: string | null;
  lightboxUrl?: string | null;
  altText?: string | null;
}

export interface ProductWithImage {
  databaseId: number;
  image?: ProductImageLike | null;
  galleryImages?: { nodes?: ProductImageLike[] | null } | null;
}

interface EnrichOptions {
  sourceSize?: StoreApiImageSource;
}

type MutableRecord = Record<string, unknown>;

interface ImageRecord extends MutableRecord {
  databaseId?: unknown;
  image?: unknown;
  galleryImages?: unknown;
}

interface ImageUrlRecord extends MutableRecord {
  productId?: unknown;
  imageUrl?: unknown;
  imageAlt?: unknown;
}

function isRecord(value: unknown): value is MutableRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasSourceUrl(image: unknown) {
  return isRecord(image) && typeof image.sourceUrl === "string" && image.sourceUrl.length > 0;
}

function hasImageUrl(record: ImageUrlRecord) {
  return typeof record.imageUrl === "string" && record.imageUrl.length > 0;
}

function mapStoreApiImage(
  image: StoreApiProductImage,
  sourceSize: StoreApiImageSource,
): ProductImageLike | null {
  if (!image.src) {
    return null;
  }

  return {
    sourceUrl: sourceSize === "full" ? image.src : image.thumbnail ?? image.src,
    thumbnailUrl: image.thumbnail ?? image.src,
    lightboxUrl: image.src,
    altText: image.alt ?? null,
  };
}

function chunkProductIds(productIds: number[]) {
  const chunks: number[][] = [];

  for (let index = 0; index < productIds.length; index += STORE_API_PAGE_SIZE) {
    chunks.push(productIds.slice(index, index + STORE_API_PAGE_SIZE));
  }

  return chunks;
}

async function fetchStoreApiProductImages(
  productIds: number[],
  { sourceSize = "thumbnail" }: EnrichOptions = {},
) {
  const imagesByProductId = new Map<number, ProductImageLike[]>();
  const uniqueProductIds = [...new Set(productIds)].filter((id) => Number.isFinite(id));

  if (uniqueProductIds.length === 0) {
    return imagesByProductId;
  }

  try {
    for (const productIdChunk of chunkProductIds(uniqueProductIds)) {
      const params = new URLSearchParams({
        include: productIdChunk.join(","),
        per_page: String(STORE_API_PAGE_SIZE),
        _fields: "id,images",
      });
      const response = await fetch(`${STORE_API_PRODUCTS_URL}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });
      const products = await parseJsonResponse<StoreApiProduct[]>(
        response,
        "WooCommerce Store product image fallback",
      );

      for (const product of products) {
        if (typeof product.id !== "number") {
          continue;
        }

        const images = (product.images ?? [])
          .map((image) => mapStoreApiImage(image, sourceSize))
          .filter((image): image is ProductImageLike => Boolean(image?.sourceUrl));

        imagesByProductId.set(product.id, images);
      }
    }
  } catch (error) {
    console.error("Failed to fetch WooCommerce Store API product image fallback.", error);
  }

  return imagesByProductId;
}

function applyFallbackImage(record: ImageRecord, fallbackImages: ProductImageLike[]) {
  const [primaryImage, ...galleryImages] = fallbackImages;

  if (!primaryImage) {
    return;
  }

  record.image = primaryImage;

  if (!isRecord(record.galleryImages)) {
    return;
  }

  const currentGalleryNodes = record.galleryImages.nodes;
  if (Array.isArray(currentGalleryNodes) && currentGalleryNodes.length > 0) {
    return;
  }

  record.galleryImages = {
    ...record.galleryImages,
    nodes: galleryImages,
  };
}

function collectImageRecords(
  value: unknown,
  imageRecords: ImageRecord[],
  imageUrlRecords: ImageUrlRecord[],
  seen = new Set<object>(),
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectImageRecords(item, imageRecords, imageUrlRecords, seen);
    }
    return;
  }

  if (!isRecord(value) || seen.has(value)) {
    return;
  }

  seen.add(value);

  if (
    typeof value.databaseId === "number" &&
    "image" in value &&
    !hasSourceUrl(value.image)
  ) {
    imageRecords.push(value as ImageRecord);
  }

  if (
    typeof value.productId === "number" &&
    "imageUrl" in value &&
    !hasImageUrl(value as ImageUrlRecord)
  ) {
    imageUrlRecords.push(value as ImageUrlRecord);
  }

  for (const child of Object.values(value)) {
    collectImageRecords(child, imageRecords, imageUrlRecords, seen);
  }
}

export async function enrichProductImages<T extends ProductWithImage>(
  products: T[],
  options?: EnrichOptions,
): Promise<T[]> {
  const imageRecords = products
    .filter((product) => !hasSourceUrl(product.image))
    .map((product) => product as unknown as ImageRecord);

  if (imageRecords.length === 0) {
    return products;
  }

  const imagesByProductId = await fetchStoreApiProductImages(
    imageRecords
      .map((record) => record.databaseId)
      .filter((databaseId): databaseId is number => typeof databaseId === "number"),
    options,
  );

  for (const record of imageRecords) {
    if (typeof record.databaseId !== "number") {
      continue;
    }

    applyFallbackImage(record, imagesByProductId.get(record.databaseId) ?? []);
  }

  return products;
}

export async function enrichProductImagesInGraphqlResponse<T>(
  data: T,
  options?: EnrichOptions,
): Promise<T> {
  const imageRecords: ImageRecord[] = [];
  const imageUrlRecords: ImageUrlRecord[] = [];
  collectImageRecords(data, imageRecords, imageUrlRecords);

  if (imageRecords.length === 0 && imageUrlRecords.length === 0) {
    return data;
  }

  const productIds = [
    ...imageRecords.map((record) => record.databaseId),
    ...imageUrlRecords.map((record) => record.productId),
  ].filter((productId): productId is number => typeof productId === "number");
  const imagesByProductId = await fetchStoreApiProductImages(productIds, options);

  for (const record of imageRecords) {
    if (typeof record.databaseId !== "number") {
      continue;
    }

    applyFallbackImage(record, imagesByProductId.get(record.databaseId) ?? []);
  }

  for (const record of imageUrlRecords) {
    if (typeof record.productId !== "number") {
      continue;
    }

    const [primaryImage] = imagesByProductId.get(record.productId) ?? [];
    if (!primaryImage?.sourceUrl) {
      continue;
    }

    record.imageUrl = primaryImage.sourceUrl;
    record.imageAlt = typeof record.imageAlt === "string" ? record.imageAlt : primaryImage.altText ?? null;
  }

  return data;
}
