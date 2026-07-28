/** Renderuje podstawową, responsywną siatkę kart produktów. */
import Link from "next/link";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { PromotionBadge } from "@/components/PromotionBadge/PromotionBadge";
import { sanitizePriceHtml } from "@/lib/sanitize-html";

interface ProductNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: { sourceUrl: string } | null;
  price?: string;
  onSale?: boolean | null;
}

interface Props {
  products: ProductNode[];
}

export default function BasicProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/produkt/${p.slug}`}
          className="group bg-[#fafaf9] border border-[#e7e5e4] rounded-lg overflow-hidden flex flex-col hover:border-[#171717]/40 transition-colors"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-[#fafaf9]">
            <ProductThumbnail
              src={p.image?.sourceUrl}
              alt={p.name}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              imageClassName="transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {p.onSale && <PromotionBadge />}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h2 className="font-semibold mb-1">{p.name}</h2>
            {p.price && (
              <p
                className="text-sm text-[#171717]/60"
                dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(p.price) }}
              />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
