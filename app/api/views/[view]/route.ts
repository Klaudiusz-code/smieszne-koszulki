import { NextRequest } from "next/server";
import { getHomeViewData, getProductViewData, getShopViewData, getContentViewData } from "@/lib/server/views";
import { apiJson, apiFailure } from "@/lib/server/http";
import { ServiceError } from "@/lib/server/errors";
import { getClientIp, rateLimit } from "@/lib/api-security";

export async function GET(req: NextRequest, { params }: { params: Promise<{ view: string }> }) {
  const limit = rateLimit({ key: `views:ip:${getClientIp(req)}`, limit: 120, windowMs: 60000 });
  if (limit) return apiFailure(new ServiceError("rate_limit", "Za dużo prób.", 429));
  const { view } = await params;
  const search = req.nextUrl.searchParams;
  if (req.url.length > 4096) return apiFailure(new ServiceError("validation", "Zbyt długi adres.", 400));
  const slug = search.get("slug") || "";
  const filters = Object.fromEntries([...search.keys()].map((key) => [key, search.getAll(key)]));
  try {
    let data;
    switch (view) {
      case "home": data = await getHomeViewData(); break;
      case "product":
        if (!slug || slug.includes("/") || slug.length > 200) throw new ServiceError("validation", "Nieprawidłowy identyfikator produktu.", 400);
        data = await getProductViewData(slug); if (!data.product) data = null; break;
      case "shop": data = await getShopViewData(filters); break;
      case "category": if (!slug) throw new ServiceError("validation", "Brak kategorii.", 400); data = await getShopViewData(filters, slug); break;
      case "content": data = await getContentViewData((search.get("path") || "").split("/").filter(Boolean)); break;
      default: throw new ServiceError("not_found", "Nie znaleziono widoku.", 404);
    }
    if (!data) throw new ServiceError("not_found", "Nie znaleziono danych widoku.", 404);
    return apiJson({ data });
  } catch (error) { return apiFailure(error); }
}
