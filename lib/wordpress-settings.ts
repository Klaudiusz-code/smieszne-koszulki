export function resolveWordPressSettings(env: Record<string, string | undefined>) {
  const graphql = httpUrl(env.WORDPRESS_GRAPHQL_URL || "https://zabawnekoszulki.pl/graphql", "WORDPRESS_GRAPHQL_URL");
  const base = httpUrl(env.WORDPRESS_BASE_URL || graphql.href.replace(/\/graphql\/?$/, "/"), "WORDPRESS_BASE_URL");
  base.pathname = `${base.pathname.replace(/\/$/, "")}/`;
  const rest = httpUrl(env.WORDPRESS_REST_URL || new URL("wp-json/", base).href, "WORDPRESS_REST_URL");
  rest.pathname = `${rest.pathname.replace(/\/$/, "")}/`;

  return {
    graphqlUrl: graphql.href,
    baseUrl: base.href,
    restUrl: rest.href,
    storeProductsUrl: new URL("wc/store/v1/products", rest).href,
    contactFormsUrl: new URL("contact-form-7/v1/contact-forms/", rest).href,
  };
}

function httpUrl(value: string, name: string) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error();
    }
    return url;
  } catch {
    throw new Error(`Nieprawidłowa konfiguracja ${name}: wymagany adres HTTP(S) bez danych logowania, query i fragmentu.`);
  }
}
