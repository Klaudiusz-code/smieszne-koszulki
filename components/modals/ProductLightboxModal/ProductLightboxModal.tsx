/**
 * Odpowiedzialność komponentu:
 * - prezentuje galerię produktu w pełnoekranowym podglądzie,
 * - umożliwia przechodzenie między zdjęciami oraz zmianę powiększenia,
 * - obsługuje sterowanie klawiaturą i zamykanie modala.
 */
"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { CloseButton } from "@/components/buttons/CloseButton";
import { ChevronLeftIcon } from "@/components/icons/ChevronLeftIcon";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { ZoomInIcon } from "@/components/icons/ZoomInIcon";
import { ZoomOutIcon } from "@/components/icons/ZoomOutIcon";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import type { ProductImage } from "@/types/product";
import { useProductLightboxKeyboard } from "./useProductLightboxKeyboard";

function getImageKey(image: ProductImage) {
  return image.lightboxUrl || image.sourceUrl;
}

export function ProductLightboxModal({
  images,
  activeIndex,
  zoom,
  productName,
  setActiveIndex,
  setZoom,
}: {
  images: ProductImage[];
  activeIndex: number | null;
  zoom: number;
  productName: string;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
  setZoom: Dispatch<SetStateAction<number>>;
}) {
  useProductLightboxKeyboard({
    active: activeIndex !== null,
    imageCount: images.length,
    setLightboxIndex: setActiveIndex,
    setLightboxZoom: setZoom,
  });

  const image = activeIndex !== null ? images[activeIndex] : null;
  if (!image) {
    return null;
  }

  function close() {
    setActiveIndex(null);
    setZoom(1);
  }

  function changeImage(direction: -1 | 1) {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null || images.length === 0) {
        return currentIndex;
      }

      return (currentIndex + direction + images.length) % images.length;
    });
    setZoom(1);
  }

  function changeZoom(delta: number) {
    setZoom((currentZoom) =>
      Math.min(2.5, Math.max(1, Number((currentZoom + delta).toFixed(1)))),
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Podgląd zdjęcia produktu"
      className="fixed inset-0 z-50 bg-[#000000]/92 px-4 py-5 text-white sm:px-6 sm:py-6"
      onClick={close}
    >
      <div
        className="relative flex h-full flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeZoom(-0.5)}
              disabled={zoom <= 1}
              aria-label="Oddal zdjęcie"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ZoomOutIcon className="h-5 w-5" />
            </button>
            <span className="min-w-14 text-center text-[14px] tabular-nums text-white/78">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => changeZoom(0.5)}
              disabled={zoom >= 2.5}
              aria-label="Przybliż zdjęcie"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ZoomInIcon className="h-5 w-5" />
            </button>
          </div>

          <CloseButton
            onClick={close}
            label="Zamknij podgląd"
            variant="dark"
          />
        </div>

        <div className="relative mt-5 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => changeImage(-1)}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 sm:left-2"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setZoom((currentZoom) => (currentZoom > 1 ? 1 : 2))}
            aria-label={zoom > 1 ? "Oddal zdjęcie" : "Przybliż zdjęcie"}
            className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
              zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
          >
            <Image
              src={image.lightboxUrl || image.sourceUrl}
              alt={image.altText || productName}
              fill
              sizes="100vw"
              className="h-full w-full object-contain transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
            />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => changeImage(1)}
              aria-label="Następne zdjęcie"
              className="absolute right-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 sm:right-2"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-5 flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((thumbnail, index) => (
              <button
                key={getImageKey(thumbnail)}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setZoom(1);
                }}
                aria-label={`Pokaż zdjęcie ${index + 1}`}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border transition-colors ${
                  activeIndex === index
                    ? "border-white"
                    : "border-white/20 hover:border-white/55"
                }`}
              >
                <ProductThumbnail
                  src={thumbnail.thumbnailUrl || thumbnail.sourceUrl}
                  alt=""
                  sizes="56px"
                  placeholderIconClassName="h-4 w-4 text-[#F2EEE9]"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
