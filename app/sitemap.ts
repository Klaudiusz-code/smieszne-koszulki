import type { MetadataRoute } from "next";
import {
  fetchAllProductCategories,
  fetchAllProductsWithDescriptionsAndCategories,
} from "@/lib/catalog-data";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = ["/", "/produkty", "/kolekcje", "/prezenty", "/kontakt"];

function sitemapEntry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_ROUTES.map((path) =>
    sitemapEntry(path, path === "/" ? 1 : 0.8, "weekly"),
  );

  try {
    const [{ products }, categories] = await Promise.all([
      fetchAllProductsWithDescriptionsAndCategories(),
      fetchAllProductCategories(),
    ]);

    const productEntries = products.map((product) =>
      sitemapEntry(`/produkt/${product.slug}`, 0.7, "weekly"),
    );

    const categoryEntries = categories.map((category) =>
      sitemapEntry(`/kategoria/${category.slug}`, 0.75, "weekly"),
    );

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch (error) {
    console.warn("Sitemap dynamic entries failed; returning static entries.", error);
    return staticEntries;
  }
}
