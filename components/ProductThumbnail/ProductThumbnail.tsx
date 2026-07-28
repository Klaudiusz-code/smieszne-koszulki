/** Renderuje zoptymalizowaną miniaturę produktu albo zastępczą ikonę braku zdjęcia. */
import Image from "next/image";
import { ImagePlaceholderIcon } from "@/components/icons/ImagePlaceholderIcon";

interface ProductThumbnailProps {
  src?: string | null;
  alt?: string | null;
  sizes: string;
  loading?: "eager" | "lazy";
  preload?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  imageClassName?: string;
  placeholderIconClassName?: string;
}

export function ProductThumbnail({
  src,
  alt,
  sizes,
  loading,
  preload,
  fetchPriority,
  className = "",
  imageClassName = "",
  placeholderIconClassName = "h-10 w-10 text-[#B8AAA2]",
}: ProductThumbnailProps) {
  return (
    <div className={`relative h-full w-full bg-[#fafaf9] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt || ""}
          fill
          sizes={sizes}
          loading={loading}
          preload={preload}
          fetchPriority={fetchPriority}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImagePlaceholderIcon className={placeholderIconClassName} />
        </div>
      )}
    </div>
  );
}
