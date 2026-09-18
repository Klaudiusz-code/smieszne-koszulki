import type { NextConfig } from "next";
import { resolveWordPressSettings } from "./lib/wordpress-settings";

const wordpress = resolveWordPressSettings(process.env);
const mediaUrl = new URL(wordpress.baseUrl);
const backendOrigins = [...new Set([wordpress.baseUrl, wordpress.graphqlUrl, wordpress.restUrl].map((url) => new URL(url).origin))].join(" ");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{
      protocol: mediaUrl.protocol.slice(0, -1) as "https" | "http",
      hostname: mediaUrl.hostname,
      port: mediaUrl.port,
      pathname: `${mediaUrl.pathname}wp-content/uploads/**`,
      search: "",
    }],
  },
  poweredByHeader: false,
  async rewrites() {
    return { beforeFiles: [{ source: "/feed", destination: "/api/feed" }], afterFiles: [], fallback: [] };
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(self)",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'self'",
          "form-action 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://geowidget.easypack24.net",
          "style-src 'self' 'unsafe-inline' https://geowidget.easypack24.net",
          `img-src 'self' data: blob: ${backendOrigins} https://www.google-analytics.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://osm.inpost.pl https://geowidget.easypack24.net`,
          "font-src 'self' data: https://geowidget.easypack24.net",
          `connect-src 'self' ${backendOrigins} https://www.google-analytics.com https://*.google-analytics.com https://*.googlesyndication.com https://api-pl-points.easypack24.net https://osm.inpost.pl`,
          "frame-src 'self' https://*.googlesyndication.com https://googleads.g.doubleclick.net",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/zamowienie/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/resetuj-haslo",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
