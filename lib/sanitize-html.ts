import sanitizeHtml from "sanitize-html";

const PRICE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["span", "bdi", "abbr", "del", "ins"],
  allowedAttributes: {
    "*": ["class"],
    abbr: ["title"],
  },
};

const RICH_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "del", "ins",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "img", "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "class", "loading"],
    "*": ["class", "id"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
};

const GATEWAY_ICON_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "img", "span",
    "svg", "path", "g", "rect", "circle", "polyline", "polygon", "line", "defs", "use",
  ],
  allowedAttributes: {
    img: ["src", "alt", "width", "height", "class"],
    span: ["class"],
    svg: ["xmlns", "viewBox", "width", "height", "fill", "class", "aria-hidden"],
    "*": ["class", "d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "cx", "cy", "r", "x", "y", "x1", "y1", "x2", "y2", "points"],
  },
  allowedSchemes: ["http", "https", "data"],
};

const INLINE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["strong", "b", "em", "i", "a", "span", "br"],
  allowedAttributes: {
    a: ["href", "class"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https"],
};

export function sanitizePriceHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, PRICE_OPTIONS);
}

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, RICH_OPTIONS);
}

export function sanitizeGatewayIcon(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, GATEWAY_ICON_OPTIONS);
}

export function sanitizeInlineHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, INLINE_OPTIONS);
}
