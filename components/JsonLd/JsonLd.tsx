/** Osadza bezpiecznie zserializowane dane strukturalne JSON-LD w dokumencie. */
import { serializeJsonLd } from "@/lib/seo";

export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      {...(id ? { id } : {})}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
