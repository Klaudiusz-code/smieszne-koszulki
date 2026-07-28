/**
 * Odpowiedzialność komponentu trasy:
 * - rozpoznaje dynamiczną ścieżkę treści WordPressa,
 * - pobiera stronę lub wpis wraz z metadanymi SEO,
 * - renderuje bezpieczną treść oraz dane strukturalne,
 * - zwraca widok 404, gdy zasób nie istnieje.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  absoluteUrl,
  articleSchema,
  breadcrumbSchema,
  createSeoMetadata,
  getSeoDescription,
  merchantReturnPolicySchema,
  stripHtml,
  webPageSchema,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

type Params = { segments: string[] };

import { getContentViewData } from "@/lib/server/views";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { segments: slug } = await params;
  const result = await getContentViewData(slug);
  const path = `/${slug.join("/")}`;
  if (!result) {
    return createSeoMetadata({
      title: "Nie znaleziono strony",
      description: "Nie znaleziono strony w sklepie Zabawne Koszulki.",
      path,
      noIndex: true,
    });
  }
  return createSeoMetadata({
    title: result.title,
    description: getSeoDescription(result.content),
    path,
  });
}

function buildBreadcrumbForRoute(segments: string[], title: string) {
  const items = [{ name: "Start", url: absoluteUrl("/") }];

  if (segments.length === 4) {
    items.push({ name: "Blog", url: absoluteUrl(`/${segments[0]}/`) });
  }

  items.push({ name: title, url: absoluteUrl(`/${segments.join("/")}`) });
  return breadcrumbSchema(items);
}

export default async function WPRoute({ params }: { params: Promise<Params> }) {
  const { segments: slug } = await params;
  const result = await getContentViewData(slug);
  if (!result) notFound();

  const url = absoluteUrl(`/${slug.join("/")}`);
  const description = getSeoDescription(result.content);
  const breadcrumb = buildBreadcrumbForRoute(slug, result.title);

  const articleLd =
    result.type === "post"
      ? articleSchema({
          url,
          headline: result.title,
          description: result.excerpt ? stripHtml(result.excerpt) : description,
          image: result.image?.sourceUrl ?? null,
          datePublished: result.date ?? null,
          dateModified: result.modified ?? result.date ?? null,
          authorName: result.author ?? null,
        })
      : null;

  const webPageLd =
    result.type === "page"
      ? webPageSchema({ url, name: result.title, description })
      : null;

  const isReturnsPage = slug.length === 1 && slug[0] === "zwroty";

  return (
    <div className="my-[64px]">
      <JsonLd data={breadcrumb} id="ld-breadcrumbs" />
      {articleLd ? <JsonLd data={articleLd} id="ld-article" /> : null}
      {webPageLd ? <JsonLd data={webPageLd} id="ld-webpage" /> : null}
      {isReturnsPage ? <JsonLd data={merchantReturnPolicySchema()} id="ld-return-policy" /> : null}
      <h1 className="text-[34px] font-medium sm:text-[36px]">
        <b>{result.title}</b>
      </h1>
      <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(result.content) }} />
    </div>
  );
}
