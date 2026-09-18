export { default, generateMetadata } from "@/lib/routing/Storefront";

// One catch-all serves both public pages and request-specific search/order parameters.
// Render the page per request while retaining explicit revalidate values on data fetches.
export const revalidate = 0;
