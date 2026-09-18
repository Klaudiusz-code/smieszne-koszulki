/**
 * Odpowiedzialność komponentu:
 * - prezentuje galerię, cenę, opis i warianty produktu,
 * - zarządza wyborem wariantu oraz dodawaniem produktu do koszyka,
 * - obsługuje listę życzeń, dostępność i stan produktu w koszyku,
 * - prezentuje oraz umożliwia dodawanie opinii o produkcie.
 */
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/buttons/Button";
import { storeApi } from "@/lib/api/client";
import { sanitizePriceHtml, sanitizeRichHtml } from "@/lib/sanitize-html";
import { useAuthState } from "@/contexts/auth-state/useAuthState";
import { useCart } from "@/packages/commerce/react";
import { StarIcon } from "@/components/icons/StarIcon";
import { ZoomInIcon } from "@/components/icons/ZoomInIcon";
import { RelatedProductsSection } from "@/sections/products/RelatedProductsSection";
import { useProductCartStatus, type ProductCartStatusItem } from "./useProductCartStatus";
import { useProductVariationSelection } from "./useProductVariationSelection";
import { getListingPriceHtml } from "@/lib/product-price";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { PromotionBadge } from "@/components/PromotionBadge/PromotionBadge";
import Breadcrumb from "@/components/Breadcrumb";
import { trackAddToCart, trackViewItem, trackRemoveFromCart } from "@/lib/gtag";
import {
  ProductLightboxModal,
} from "@/components/modals/ProductLightboxModal/ProductLightboxModal";
import type {
  ProductAttribute as ProductAttr,
  ProductData,
  ProductImage,
  ProductReview as Review,
  ProductVariation as Variation,
  SimilarProduct,
} from "@/types/product";

function formatSlugLabel(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function optionLabel(attr: ProductAttr, value: string): string {
  const term = attr.terms.find(
    (node) => node.slug === value || node.name === value
  );

  return term?.name || formatSlugLabel(value);
}

function isProductImage(image: ProductImage | null | undefined): image is ProductImage {
  return Boolean(image?.sourceUrl);
}

function getProductImageKey(image: ProductImage) {
  return image.lightboxUrl || image.sourceUrl;
}

function cartItemMatchesVariation(item: ProductCartStatusItem, variation: Variation): boolean {
  if (item.variation?.databaseId === variation.databaseId) {
    return true;
  }

  const itemAttrs = item.variation?.attributes ?? [];

  if (itemAttrs.length === 0) {
    return false;
  }

  return variation.attributes.every((variationAttr) =>
    itemAttrs.some(
      (itemAttr) =>
        itemAttr.name === variationAttr.name && itemAttr.value === variationAttr.value
    )
  );
}

function getCartQuantity(items: ProductCartStatusItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function formatReviewDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "K";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StarRow({
  value,
  size = "md",
}: {
  value?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const rating = typeof value === "number" ? value : 0;
  const iconClass = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1 text-[#C8942D]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={rating >= star - 0.25} className={iconClass} />
      ))}
    </div>
  );
}

const REVIEW_RATING_LABELS: Record<number, string> = {
  1: "Nie spełnił oczekiwań",
  2: "Może być",
  3: "Dobry wybór",
  4: "Bardzo dobry",
  5: "Zachwycający",
};

function ReviewRatingPicker({
  value,
  disabled,
  onChange,
}: {
  value: number | null;
  disabled?: boolean;
  onChange: (rating: number | null) => void;
}) {
  return (
    <div className="inline-flex max-w-full rounded-xl border border-[#e7e5e4] bg-white px-3 py-2.5 shadow-[0_8px_22px_rgba(78,52,46,0.04)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Ocena produktu">
          {[1, 2, 3, 4, 5].map((rating) => {
            const selected = value !== null && rating <= value;

            return (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={value === rating}
                aria-label={`${rating} z 5`}
                disabled={disabled}
                onClick={() => onChange(value === rating ? null : rating)}
                className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                  selected
                    ? "text-[#B57A17]"
                    : "text-[#CBBDB3] hover:bg-[#fafaf9] hover:text-[#ddb745]"
                }`}
              >
                <StarIcon
                  filled={selected}
                  className={`h-7 w-7 transition-transform ${
                    selected ? "drop-shadow-[0_5px_10px_rgba(181,122,23,0.18)]" : "group-hover:scale-105"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-1 text-[13px]">
          {value !== null ? (
            <>
              <span className="rounded-full bg-[#F8F0DF] px-2.5 py-0.5 font-medium text-[#8A5A11]">
                {value}/5
              </span>
              <span className="text-[#57534e]">{REVIEW_RATING_LABELS[value]}</span>
            </>
          ) : (
            <span className="text-[#78716c]">Wybierz ocenę</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const authorName = review.author || "Klient";
  const dateLabel = formatReviewDate(review.date);
  const textPreview = stripHtml(review.content);

  return (
    <article className="rounded-xl bg-cd-light p-5 shadow-[0_10px_28px_rgba(78,52,46,0.06)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5ECE5] text-[13px] font-semibold text-[#171717]">
          {getInitials(authorName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div>
              <h4 className="text-[16px] font-medium leading-tight text-[#171717]">
                {authorName}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#78716c]">
                {dateLabel ? <span>{dateLabel}</span> : null}
                {review.isPending ? (
                  <span className="rounded-full bg-[#F8F0DF] px-2 py-0.5 text-[#8A5A11]">
                    Czeka na publikację
                  </span>
                ) : null}
              </div>
            </div>
            {typeof review.rating === "number" ? (
              <StarRow value={review.rating} size="sm" />
            ) : null}
          </div>

          {review.isLocal ? (
            <p className="mt-4 text-[15px] leading-7 text-[#57534e]">
              {textPreview}
            </p>
          ) : (
            <div
              className="mt-4 text-[15px] leading-7 text-[#57534e] [&_p]:mb-3 [&_p]:mt-0 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(review.content) }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProductView({
  product,
  similarProducts,
}: {
  product: ProductData;
  similarProducts: SimilarProduct[];
}) {
  const [adding, setAdding] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
  const [activeTab, setActiveTab] = useState<"opis" | "atrybuty" | "opinie">("opis");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { addItem, removeItems, busy: cartBusy, error: cartError, refresh: refreshCart } = useCart();
  const { loggedIn, userName } = useAuthState();
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(product.reviews ?? []);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    trackViewItem({
      id: product.databaseId,
      name: product.name,
      price: product.price,
      sku: product.sku,
      category: product.categories[0]?.name,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVariable = product.type === "variable";
  const allAttrs = product.attributes;
  const variantAttrs = allAttrs.filter((a) => a.variation);
  const detailAttrs = allAttrs.filter((a) => !a.variation);
  const reviewsAllowed = product.reviewsAllowed !== false;
  const { selected, setSelected, matchedVariation } = useProductVariationSelection({
    product,
    variantAttrs,
    isVariable,
  });
  const { cartItems } = useProductCartStatus();

  async function handleAddToCart() {
    setAdding(true);
    setMessage(null);

    if (isVariable && !matchedVariation) {
      setMessage("Wybierz wszystkie opcje produktu.");
      setAdding(false);
      return;
    }

    const variables = isVariable && matchedVariation
      ? { productId: product.databaseId, variationId: matchedVariation.databaseId }
      : { productId: product.databaseId };

    try {
      await addItem(variables);
      trackAddToCart({
        id: matchedVariation?.databaseId ?? product.databaseId,
        name: product.name,
        price: matchedVariation?.price ?? product.price,
        sku: matchedVariation?.sku ?? product.sku,
        category: product.categories[0]?.name,
      });
    } catch {
      setMessage("Nie udało się potwierdzić dodania produktu. Odśwież koszyk przed kolejną próbą.");
    } finally { setAdding(false); }
  }

  async function handleRemoveFromCart(keys: string[]) {
    if (!keys.length) return;
    setRemovingFromCart(true);
    setMessage(null);
    try {
      await removeItems(keys);
      trackRemoveFromCart({ id: product.databaseId, name: product.name, price: product.price });
    } catch {
      setMessage("Nie udało się potwierdzić usunięcia produktu. Odśwież koszyk przed kolejną próbą.");
    } finally { setRemovingFromCart(false); }
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reviewsAllowed) {
      return;
    }

    const trimmedContent = reviewContent.trim();
    const trimmedAuthor = reviewAuthor.trim();
    const trimmedEmail = reviewEmail.trim();

    setReviewError(null);
    setReviewMessage(null);

    if (!trimmedContent) {
      setReviewError("Wpisz treść opinii.");
      return;
    }

    if (reviewRating === null) {
      setReviewError("Wybierz ocenę produktu.");
      return;
    }

    if (!loggedIn && !trimmedAuthor) {
      setReviewError("Podaj imię lub podpis do opinii.");
      return;
    }

    if (!loggedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setReviewError("Podaj poprawny adres e-mail.");
      return;
    }

    setReviewSubmitting(true);

    const input: {
      commentOn: number;
      content: string;
      rating: number;
      author?: string;
      authorEmail?: string;
    } = {
      commentOn: product.databaseId,
      content: trimmedContent,
      rating: reviewRating,
    };

    if (loggedIn) {
      input.author = userName || "Klient";
    } else {
      input.author = trimmedAuthor;
      input.authorEmail = trimmedEmail;
    }

    try {
      const submittedReview = await storeApi("products/review", {
        productId: product.databaseId, content: trimmedContent, rating: reviewRating,
        author: input.author, authorEmail: input.authorEmail,
      });
      const submittedStatus = submittedReview?.status ?? null;
      const submittedAuthor =
        submittedReview.author || input.author || userName || "Klient";

      setReviews((currentReviews) => [
        {
          author: submittedAuthor,
          date: submittedReview?.date ?? new Date().toISOString(),
          content: trimmedContent,
          rating: submittedReview.rating ?? reviewRating,
          isLocal: true,
          isPending: submittedStatus !== "APPROVE",
        },
        ...currentReviews,
      ]);
      setReviewContent("");
      setReviewRating(null);
      setReviewMessage(
        submittedStatus === "APPROVE"
          ? "Dziękujemy za opinię. Jest już widoczna na stronie."
          : "Dziękujemy za opinię. Może pojawić się publicznie po akceptacji."
      );
    } catch {
      setReviewError("Nie udało się wysłać opinii. Spróbuj ponownie za chwilę.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const displayImage =
    [
      activeImage,
      matchedVariation?.image,
      product.image,
      ...product.galleryImages,
    ].find(isProductImage) ?? null;
  const displayPriceHtml = getListingPriceHtml(matchedVariation ?? product);
  const displayPromotionBadge = matchedVariation
    ? Boolean(
        matchedVariation.salePrice &&
        matchedVariation.regularPrice &&
        matchedVariation.salePrice !== matchedVariation.regularPrice,
      )
    : Boolean(product.onSale);
  const currentSku = matchedVariation?.sku || product.sku || "Brak SKU";
  const currentStockStatus = matchedVariation?.stockStatus ?? product.stockStatus;
  const currentStockQuantity = matchedVariation
    ? matchedVariation.stockQuantity
    : product.stockQuantity;
  const needsVariantSelection = isVariable && variantAttrs.length > 0 && !matchedVariation;
  const storefrontAvailabilityLabel =
    currentStockStatus === "OUT_OF_STOCK"
      ? "Niedostępny"
      : needsVariantSelection
        ? "Wybierz wariant"
        : currentStockStatus === "ON_BACKORDER"
          ? "Na zamówienie"
          : "Dostępny — wysyłka w 24h";
  const storefrontAvailabilityDotClass =
    currentStockStatus === "OUT_OF_STOCK" || needsVariantSelection
      ? "bg-stone-300"
      : currentStockStatus === "ON_BACKORDER"
        ? "bg-[#ddb745]"
        : "bg-[#27ae60]";
  const stockQuantityLabel =
    typeof currentStockQuantity === "number"
      ? `${currentStockQuantity} szt.`
      : currentStockStatus === "OUT_OF_STOCK"
        ? "Nie"
        : currentStockStatus === "ON_BACKORDER"
          ? "Na zamówienie"
          : "Tak";
  const isCurrentOutOfStock = currentStockStatus === "OUT_OF_STOCK";
  const productVariationIds = new Set(
    product.variations.map((variation) => variation.databaseId) ?? []
  );
  const productCartItems = cartItems.filter(
    (item) =>
      item.product.databaseId === product.databaseId ||
      (typeof item.variation?.databaseId === "number" &&
        productVariationIds.has(item.variation.databaseId))
  );
  const currentCartItems = isVariable
    ? matchedVariation
      ? productCartItems.filter((item) => cartItemMatchesVariation(item, matchedVariation))
      : []
    : productCartItems;
  const currentCartQuantity = getCartQuantity(currentCartItems);
  const productCartQuantity = getCartQuantity(productCartItems);
  const hasCurrentCartItem = currentCartQuantity > 0;
  const hasAnyProductCartItem = productCartQuantity > 0;
  const removableCartItems =
    isVariable && !matchedVariation ? productCartItems : currentCartItems;
  const removableCartKeys = removableCartItems.map((item) => item.key);
  const removableCartQuantity = getCartQuantity(removableCartItems);
  const showRemoveFromCart = hasCurrentCartItem || (isVariable && !matchedVariation && hasAnyProductCartItem);
  const removeFromCartLabel =
    isVariable && !matchedVariation
      ? `Usuń warianty z koszyka (${removableCartQuantity} szt.)`
      : `Usuń z koszyka (${removableCartQuantity} szt.)`;
  const addToCartDisabled = Boolean(
    adding || cartBusy || Boolean(cartError) ||
    (isVariable && !matchedVariation) ||
    isCurrentOutOfStock
  );

  const allImages = [
    product.image,
    ...product.galleryImages,
  ].filter(isProductImage).filter((image, index, images) => {
    const imageKey = getProductImageKey(image);
    return images.findIndex((candidate) => getProductImageKey(candidate) === imageKey) === index;
  });
  const lightboxImages =
    displayImage &&
    !allImages.some((image) => getProductImageKey(image) === getProductImageKey(displayImage))
      ? [displayImage, ...allImages]
      : allImages;
  const displayImageKey = displayImage ? getProductImageKey(displayImage) : null;
  function openLightbox(image: ProductImage) {
    const imageKey = getProductImageKey(image);
    const imageIndex = lightboxImages.findIndex(
      (candidate) => getProductImageKey(candidate) === imageKey
    );
    setLightboxIndex(imageIndex >= 0 ? imageIndex : 0);
    setLightboxZoom(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10">
      <Breadcrumb
        items={[
          { label: "Sklep", href: "/produkty" },
          ...(product.categories[0]
            ? [{
                label: product.categories[0].name,
                href: `/kategoria/${product.categories[0].slug}`,
              }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mb-28 mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
        <div className="order-1 space-y-6 lg:col-span-3">
          {/* Zdjęcia */}
          {displayImage ? (
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-stone-50 ring-1 ring-stone-100">
              <button
                type="button"
                onClick={() => openLightbox(displayImage)}
                aria-label="Otwórz podgląd zdjęcia"
                className="h-full w-full cursor-zoom-in text-left"
              >
                <ProductThumbnail
                  src={displayImage.sourceUrl}
                  alt={displayImage.altText || product.name}
                  sizes="(min-width: 1024px) calc((100vw - 144px) / 2), calc(100vw - 40px)"
                  loading="eager"
                  preload
                  fetchPriority="high"
                  imageClassName="transition-transform duration-500 group-hover:scale-[1.02]"
                  placeholderIconClassName="h-16 w-16 text-[#B8AAA2]"
                />
              </button>
              {displayPromotionBadge ? <PromotionBadge /> : null}
              <span className="pointer-events-none absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#171717] opacity-0 shadow-[0_10px_20px_rgba(47,40,36,0.14)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <ZoomInIcon className="h-5 w-5" />
              </span>
            </div>
          ) : (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-stone-50 ring-1 ring-stone-100">
              <div aria-label={`Brak zdjęcia produktu: ${product.name}`} className="h-full w-full" role="img">
                <ProductThumbnail
                  src={null}
                  alt={product.name}
                  sizes="(min-width: 1024px) calc((100vw - 144px) / 2), calc(100vw - 40px)"
                  placeholderIconClassName="h-16 w-16 text-[#B8AAA2]"
                />
              </div>
              {displayPromotionBadge ? <PromotionBadge /> : null}
            </div>
          )}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, i) => (
                <button
                  key={getProductImageKey(image)}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`Pokaż zdjęcie ${i + 1}`}
                  aria-pressed={
                    displayImageKey === getProductImageKey(image)
                  }
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl ring-2 transition-all duration-300 ${
                    displayImageKey === getProductImageKey(image)
                      ? "scale-95 ring-stone-900"
                      : "opacity-70 ring-transparent hover:opacity-100 hover:ring-stone-200"
                  }`}
                >
                  <ProductThumbnail
                    src={image.thumbnailUrl || image.sourceUrl}
                    alt=""
                    sizes="80px"
                    placeholderIconClassName="h-5 w-5 text-[#B8AAA2]"
                  />
                </button>
              ))}
            </div>
          )}

        {/* Zakładki */}
        <div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {(["opis", "atrybuty", "opinie"] as const).map((tab) => {
              const labels = { opis: "Opis", atrybuty: "Atrybuty", opinie: `Opinie (${product.reviewCount ?? 0})` };
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-md px-4 py-2.5 text-[15px] font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-[#171717] text-white shadow-[0_10px_20px_rgba(47,40,36,0.12)]"
                      : "text-[#57534e] hover:bg-[#fafaf9] hover:text-[#171717]"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          <div className="pt-6">
            {activeTab === "opis" && (
              product.description ? (
                <div
                  className="product-description max-w-none text-[16px] leading-8 text-[#57534e] [&_a]:text-[#ddb745] [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[24px] [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:text-[#171717] [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-[20px] [&_h3]:font-medium [&_h3]:text-[#171717] [&_hr]:my-7 [&_hr]:border-[#e7e5e4] [&_li]:my-2 [&_p]:mb-5 [&_p]:mt-0 [&_strong]:font-medium [&_strong]:text-[#171717] [&_ul]:mb-5 [&_ul]:mt-0 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(product.description) }}
                />
              ) : (
                <p className="text-[15px] text-[#78716c]">Brak opisu.</p>
              )
            )}
            {activeTab === "atrybuty" && (
              detailAttrs.length > 0 ? (
                <div className="divide-y divide-[#e7e5e4]">
                  {detailAttrs.map((attr) => (
                    <div
                      key={attr.name}
                      className="grid gap-2 py-4 text-[15px] sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="font-medium text-[#78716c]">{attr.label || attr.name}</span>
                      <span className="leading-7 text-[#171717]">
                        {attr.options.map((option) => optionLabel(attr, option)).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-cd-light px-5 py-8 text-center">
                  <p className="text-[16px] font-medium text-[#171717]">Brak atrybutów.</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#78716c]">
                    Ten produkt nie ma jeszcze uzupełnionych atrybutów.
                  </p>
                </div>
              )
            )}
            {activeTab === "opinie" && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  <div className="grid gap-4">
                    {reviews.map((review, index) => (
                      <ReviewCard
                        key={`${review.author}-${review.date}-${index}`}
                        review={review}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-cd-light px-5 py-8 text-center">
                    <p className="text-[16px] font-medium text-[#171717]">Brak opinii.</p>
                    <p className="mt-2 text-[14px] leading-6 text-[#78716c]">
                      Dodaj pierwszą opinię i pomóż innym wybrać produkt.
                    </p>
                  </div>
                )}

                <div className="overflow-hidden rounded-xl bg-cd-light">
                  <form onSubmit={handleSubmitReview} className="space-y-5 p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-[22px] font-medium leading-tight text-[#171717]">
                          Dodaj opinię
                        </h3>
                        <p className="mt-1 text-[14px] leading-6 text-[#78716c]">
                          Oceń produkt i podziel się wrażeniami po zakupie.
                        </p>
                      </div>
                      {!reviewsAllowed ? (
                        <span className="self-start rounded-full bg-[#F1EFED] px-3 py-1 text-[12px] font-medium text-[#78716c]">
                          Opinie wyłączone
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-medium text-[#171717]">
                        Twoja ocena
                      </label>
                      <ReviewRatingPicker
                        value={reviewRating}
                        disabled={!reviewsAllowed || reviewSubmitting}
                        onChange={setReviewRating}
                      />
                    </div>

                    {!loggedIn ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-[13px] font-medium text-[#171717]">
                            Imię
                          </span>
                          <input
                            value={reviewAuthor}
                            onChange={(event) => setReviewAuthor(event.target.value)}
                            disabled={!reviewsAllowed || reviewSubmitting}
                            className="h-11 w-full rounded-lg border border-[#e7e5e4] bg-white px-3 text-[15px] text-[#171717] outline-none transition-colors placeholder:text-[#B9AAA0] focus:border-[#ddb745] disabled:cursor-not-allowed disabled:bg-[#f5f5f4]"
                            placeholder="Podpis"
                            autoComplete="name"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-[13px] font-medium text-[#171717]">
                            E-mail
                          </span>
                          <input
                            type="email"
                            value={reviewEmail}
                            onChange={(event) => setReviewEmail(event.target.value)}
                            disabled={!reviewsAllowed || reviewSubmitting}
                            className="h-11 w-full rounded-lg border border-[#e7e5e4] bg-white px-3 text-[15px] text-[#171717] outline-none transition-colors placeholder:text-[#B9AAA0] focus:border-[#ddb745] disabled:cursor-not-allowed disabled:bg-[#f5f5f4]"
                            placeholder="adres@email.pl"
                            autoComplete="email"
                          />
                        </label>
                      </div>
                    ) : null}

                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium text-[#171717]">
                        Opinia
                      </span>
                      <textarea
                        value={reviewContent}
                        onChange={(event) => setReviewContent(event.target.value)}
                        disabled={!reviewsAllowed || reviewSubmitting}
                        rows={5}
                        className="min-h-[132px] w-full resize-y rounded-lg border border-[#e7e5e4] bg-white px-3 py-3 text-[15px] leading-7 text-[#171717] outline-none transition-colors placeholder:text-[#B9AAA0] focus:border-[#ddb745] disabled:cursor-not-allowed disabled:bg-[#f5f5f4]"
                        placeholder="Co najbardziej Ci się spodobało?"
                      />
                    </label>

                    {reviewError ? (
                      <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-[13px] leading-5 text-[#A63A2A]">
                        {reviewError}
                      </p>
                    ) : null}
                    {reviewMessage ? (
                      <p className="rounded-lg bg-[#EDF7EA] px-3 py-2 text-[13px] leading-5 text-[#3F7B33]">
                        {reviewMessage}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      variant="primary"
                      size="form"
                      disabled={!reviewsAllowed}
                      loading={reviewSubmitting}
                      loadingLabel="Wysyłanie..."
                      elevated
                      className="rounded-lg text-[15px]"
                    >
                      Dodaj opinię
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="order-2 lg:col-span-2">
        <div className="sticky top-24 space-y-8">
          <div>
            {product.categories[0] ? (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                {product.categories[0].name}
              </p>
            ) : null}
            <h1 className="text-3xl font-medium leading-tight tracking-tight text-stone-900 lg:text-4xl">
              {product.name}
            </h1>
          </div>

          {displayPriceHtml && (
            <div
              className="flex items-baseline gap-3 text-3xl font-medium tracking-tight text-stone-900 [&_.screen-reader-text]:hidden [&_.sr-only]:hidden [&_del]:text-lg [&_del]:font-normal [&_del]:text-stone-400 [&_del]:line-through [&_ins]:no-underline"
              dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(displayPriceHtml) }}
            />
          )}

          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-6">
            <span className={`h-1.5 w-1.5 rounded-full ${storefrontAvailabilityDotClass}`} />
            <span className="text-sm font-light text-stone-500">
              {storefrontAvailabilityLabel}
            </span>
          </div>

          {product.shortDescription && (
            <div
              className="text-[16px] font-light leading-7 text-[#57534e] [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(product.shortDescription) }}
            />
          )}

          {/* Warianty */}
          {isVariable && variantAttrs.length > 0 && (
            <div className="mt-6 space-y-5 border-t border-[#e7e5e4] pt-5">
              {variantAttrs.map((attr) => (
                <div key={attr.name}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#171717]">
                      {attr.label || attr.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {attr.options.map((opt) => {
                      const isSelected = selected[attr.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSelected((prev) => ({ ...prev, [attr.name]: opt }))
                          }
                          className={`min-h-12 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                            isSelected
                              ? "bg-stone-900 text-white shadow-sm"
                              : "bg-stone-50 text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100 hover:ring-stone-400"
                          }`}
                        >
                          {optionLabel(attr, opt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-[#e7e5e4] pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Szczegóły
            </span>
            <dl className="mt-3 space-y-2 text-[15px]">
              <div className="grid grid-cols-[118px_minmax(0,1fr)] items-baseline gap-4">
                <dt className="text-[#171717]">SKU</dt>
                <dd className="min-w-0 break-all text-right font-medium text-[#171717]">
                  {currentSku}
                </dd>
              </div>
              <div className="grid grid-cols-[118px_minmax(0,1fr)] items-baseline gap-4">
                <dt className="text-[#171717]">W magazynie</dt>
                <dd className="text-right font-medium text-[#171717]">
                  {stockQuantityLabel}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {/* Dodaj do koszyka */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCartDisabled}
              className={`w-full rounded-full bg-[#27ae60] px-4 py-4 text-[16px] font-medium tracking-wide text-white shadow-sm shadow-[#27ae60]/20 transition-colors hover:bg-[#219150] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none ${
                showRemoveFromCart ? "" : "sm:col-span-2"
              }`}
            >
              {adding ? "Dodawanie..." : "Dodaj do koszyka"}
            </button>

            {showRemoveFromCart && (
              <button
                type="button"
                onClick={() => handleRemoveFromCart(removableCartKeys)}
                disabled={cartBusy || Boolean(cartError) || removingFromCart || removableCartKeys.length === 0}
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-3.5 text-[15px] font-medium text-stone-500 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:text-stone-300"
              >
                {removingFromCart ? "Usuwanie..." : removeFromCartLabel}
              </button>
            )}
          </div>

          {cartError && <button type="button" className="text-sm underline" onClick={() => { void refreshCart().catch(() => {}); }}>Odśwież koszyk</button>}
            {message && (
            <p className="mt-3 rounded-md bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>

    <RelatedProductsSection products={similarProducts} className="mt-[80px]" />

    <ProductLightboxModal
      images={lightboxImages}
      activeIndex={lightboxIndex}
      zoom={lightboxZoom}
      productName={product.name}
      setActiveIndex={setLightboxIndex}
      setZoom={setLightboxZoom}
    />
    </div>
  );
}
