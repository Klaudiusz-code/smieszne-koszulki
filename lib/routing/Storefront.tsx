import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { resolveStorefrontRoute, type RouteName } from "@/lib/routing/storefront";

type SearchParams = Record<string, string | string[] | undefined>;
export interface StorefrontProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParams>;
}
interface RouteContext {
  params: Promise<{ slug: string; orderId: string; segments: string[] }>;
  searchParams: Promise<SearchParams>;
}
interface RouteModule {
  default: (props: RouteContext) => ReactNode | Promise<ReactNode>;
  metadata?: Metadata;
  generateMetadata?: (props: RouteContext) => Promise<Metadata>;
}

const routes: Record<Exclude<RouteName, "notFound" | "categoriesRedirect">, () => Promise<RouteModule>> = {
  home: () => import("@/views/HomeView"), products: () => import("@/views/ShopView"),
  product: () => import("@/views/ProductView"), category: () => import("@/views/CategoryView"),
  collections: () => import("@/views/CollectionsView"), gifts: () => import("@/views/GiftsView"),
  customPrint: () => import("@/views/CustomPrintView"), contact: () => import("@/views/ContactView"),
  cart: () => import("@/views/CartView"), checkout: () => import("@/views/CheckoutView"),
  resetPassword: () => import("@/views/ResetPasswordView"),
  account: () => import("@/views/AccountView"), accountAddresses: () => import("@/views/AccountView"),
  accountFiles: () => import("@/views/AccountView"), accountOrders: () => import("@/views/AccountView"),
  orderPay: () => import("@/views/OrderPayView"), orderReceived: () => import("@/views/OrderReceivedView"),
  wordpress: () => import("@/views/WordPressView"),
};

async function resolve(props: StorefrontProps) {
  const { slug = [] } = await props.params;
  const route = resolveStorefrontRoute(slug, ACCOUNT_FEATURES_ENABLED);
  if (route.name === "notFound") notFound();
  if (route.name === "categoriesRedirect") permanentRedirect("/kolekcje");
  const routeModule = await routes[route.name]();
  return {
    routeModule,
    context: { params: Promise.resolve({ slug: route.slug ?? "", orderId: route.orderId ?? "", segments: slug }), searchParams: props.searchParams },
  };
}

export async function generateMetadata(props: StorefrontProps): Promise<Metadata> {
  const { routeModule, context } = await resolve(props);
  return routeModule.generateMetadata ? routeModule.generateMetadata(context) : routeModule.metadata ?? {};
}

export default async function Storefront(props: StorefrontProps) {
  const { routeModule, context } = await resolve(props);
  const View = routeModule.default;
  return <View {...context} />;
}
