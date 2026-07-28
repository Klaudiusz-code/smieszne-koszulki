import { FeedPostsDocument, type FeedPostsQuery } from "@/lib/server/wordpress/generated";
import { graphqlBody, type Envelope } from "@/packages/commerce/woocommerce/graphql";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { WORDPRESS_GRAPHQL_URL } from "@/lib/wordpress-config";

export const revalidate = 300;

type FeedPost = NonNullable<FeedPostsQuery["posts"]>["nodes"][number];
type FeedResponse = Envelope<FeedPostsQuery>;

function escapeXml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value = "") {
  return `<![CDATA[${value.split("]]>").join("]]]]><![CDATA[>")}]]>`;
}

function parseGmtDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRssDate(value?: string | null) {
  return (parseGmtDate(value) || new Date()).toUTCString().replace("GMT", "+0000");
}

function toAbsoluteUrl(uri?: string | null) {
  if (!uri) {
    return absoluteUrl("/");
  }

  return new URL(uri, SITE_URL).toString();
}

function appendPathSegment(uri: string | null | undefined, segment: string) {
  const path = uri || "/";
  return `${path.endsWith("/") ? path : `${path}/`}${segment}/`;
}

function getTerms(post: FeedPost) {
  const terms = [
    ...(post.categories?.nodes || []),
    ...(post.tags?.nodes || []),
  ];

  return terms
    .map((term) => term.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function getLastBuildDate(posts: FeedPost[]) {
  const timestamps = posts
    .map((post) => parseGmtDate(post.modifiedGmt || post.dateGmt)?.getTime())
    .filter((timestamp): timestamp is number => typeof timestamp === "number");

  if (!timestamps.length) {
    return formatRssDate();
  }

  return new Date(Math.max(...timestamps)).toUTCString().replace("GMT", "+0000");
}

function renderItem(post: FeedPost) {
  const link = toAbsoluteUrl(post.uri);
  const categories = getTerms(post)
    .map((term) => `\t\t<category>${cdata(term)}</category>`)
    .join("\n");

  return `\t<item>
\t\t<title>${escapeXml(post.title || "")}</title>
\t\t<link>${escapeXml(link)}</link>
\t\t<comments>${escapeXml(`${link}#respond`)}</comments>
\t\t<dc:creator>${cdata(post.author?.node?.name || SITE_NAME)}</dc:creator>
\t\t<pubDate>${formatRssDate(post.dateGmt)}</pubDate>
${categories ? `${categories}\n` : ""}\t\t<guid isPermaLink="false">${escapeXml(absoluteUrl(`/?p=${post.databaseId || ""}`))}</guid>
\t\t<description>${cdata(post.excerpt || "")}</description>
\t\t<content:encoded>${cdata(post.content || "")}</content:encoded>
\t\t<wfw:commentRss>${escapeXml(new URL(appendPathSegment(post.uri, "feed"), SITE_URL).toString())}</wfw:commentRss>
\t\t<slash:comments>0</slash:comments>
\t</item>`;
}

function renderFeed(data: FeedResponse) {
  const settings = data.data?.generalSettings;
  const posts = data.data?.posts?.nodes || [];
  const title = settings?.title || SITE_NAME;
  const description = settings?.description || "";
  const language = (settings?.language || "pl_PL").replace("_", "-");
  const feedUrl = absoluteUrl("/feed");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:atom="http://www.w3.org/2005/Atom"
\txmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
\txmlns:slash="http://purl.org/rss/1.0/modules/slash/"
>
<channel>
\t<title>${escapeXml(title)}</title>
\t<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
\t<link>${escapeXml(SITE_URL)}</link>
\t<description>${escapeXml(description)}</description>
\t<lastBuildDate>${getLastBuildDate(posts)}</lastBuildDate>
\t<language>${escapeXml(language)}</language>
\t<sy:updatePeriod>hourly</sy:updatePeriod>
\t<sy:updateFrequency>1</sy:updateFrequency>
\t<generator>https://nextjs.org</generator>
${posts.map(renderItem).join("\n")}
</channel>
</rss>
`;
}

export async function GET() {
  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: graphqlBody(FeedPostsDocument, {}),
    next: { revalidate },
  });

  if (!res.ok) {
    return new Response("RSS feed unavailable.", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const data = (await res.json()) as FeedResponse;

  return new Response(renderFeed(data), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
