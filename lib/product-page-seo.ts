/** Buduje metadane i dane strukturalne strony pojedynczego produktu. */
import type { Metadata } from "next";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbSchema,
  createSeoMetadata,
  getSeoDescription,
  stripHtml,
} from "@/lib/seo";
import type { ProductData } from "@/types/product";

function parsePrice(value: string | null | undefined) {
  const normalized = stripHtml(value || "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .match(/\d+(\.\d+)?/);

  return normalized?.[0];
}

function getAvailability(stockStatus: string | null | undefined) {
  if (stockStatus === "OUT_OF_STOCK") {
    return "http://schema.org/OutOfStock";
  }

  if (stockStatus === "ON_BACKORDER") {
    return "http://schema.org/BackOrder";
  }

  return "http://schema.org/InStock";
}

function getPriceValidThrough() {
  return `${new Date().getUTCFullYear() + 1}-12-31`;
}

function collectProductImages(product: ProductData) {
  const images = new Set<string>();

  if (product.image?.sourceUrl) {
    images.add(product.image.sourceUrl);
  }

  for (const node of product.galleryImages ?? []) {
    if (node?.sourceUrl) {
      images.add(node.sourceUrl);
    }
  }

  return Array.from(images);
}

function buildReviewSchemas(product: ProductData) {
  const reviews = product.reviews ?? [];

  return reviews
    .map((review) => {
      const body = stripHtml(review.content || "");
      const authorName = review.author?.trim();

      if (!body || !authorName) {
        return null;
      }

      return {
        "@type": "Review",
        author: { "@type": "Person", name: authorName },
        datePublished: review.date,
        reviewBody: body,
        ...(typeof review.rating === "number"
          ? {
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);
}

export function buildProductJsonLd(product: ProductData) {
  const price = parsePrice(product.price);
  const productUrl = absoluteUrl(`/produkt/${product.slug}/`);
  const description = stripHtml(
    product.shortDescription || product.description || product.name,
  );
  const validThrough = getPriceValidThrough();
  const images = collectProductImages(product);
  const categoryName = product.categories[0]?.name;
  const reviews = buildReviewSchemas(product);

  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: "PLN",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "PL",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
    },
  };

  const merchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "PL",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  };

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    url: productUrl,
    description,
    ...(images.length > 0 ? { image: images } : {}),
    sku: product.sku || product.slug || String(product.databaseId),
    ...(categoryName ? { category: categoryName } : {}),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "PLN",
          priceValidUntil: validThrough,
          availability: getAvailability(product.stockStatus),
          itemCondition: "https://schema.org/NewCondition",
          url: productUrl,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price,
            priceCurrency: "PLN",
            valueAddedTaxIncluded: true,
            validThrough,
          },
          shippingDetails,
          hasMerchantReturnPolicy: merchantReturnPolicy,
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
            url: absoluteUrl("/"),
          },
        }
      : undefined,
    aggregateRating:
      product.averageRating && product.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    ...(reviews.length > 0 ? { review: reviews } : {}),
  };
}

export function buildProductBreadcrumbJsonLd(product: ProductData) {
  const category = product.categories[0];
  const items = [
    { name: "Start", url: absoluteUrl("/") },
    { name: "Produkty", url: absoluteUrl("/produkty") },
  ];

  if (category) {
    items.push({
      name: category.name,
      url: absoluteUrl(`/kategoria/${category.slug}`),
    });
  }

  items.push({
    name: product.name,
    url: absoluteUrl(`/produkt/${product.slug}/`),
  });

  return breadcrumbSchema(items);
}

export function buildProductMetadata(
  product: ProductData | null,
  requestedSlug: string,
): Metadata {
  if (!product) {
    return createSeoMetadata({
      title: "Produkt",
      description: "Produkt w sklepie Zabawne Koszulki.",
      path: `/produkt/${requestedSlug}`,
      noIndex: true,
    });
  }

  return createSeoMetadata({
    title: product.name,
    description: getSeoDescription(
      product.shortDescription || product.description,
      product.name,
    ),
    path: `/produkt/${product.slug}`,
    image: product.image?.sourceUrl || undefined,
  });
}
