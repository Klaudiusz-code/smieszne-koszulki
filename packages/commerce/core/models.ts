export interface Product {
  type?: "simple" | "variable";
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText?: string | null } | null;
  /** Formatted backend prices are untrusted HTML; sanitize them when rendering. */
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  categorySlugs: string[];
}

export type ProductSort = "latest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
export type ProductStockFilter = "all" | "available" | "unavailable";
export interface ProductQueryOptions {
  search: string;
  sort: ProductSort;
  minPrice: number | null;
  maxPrice: number | null;
  stock: ProductStockFilter;
}
export interface TaxonomyFilter { taxonomy: string; terms: string[] }
export interface ProductFilters extends ProductQueryOptions {
  taxonomyFilters: TaxonomyFilter[];
  categoryId?: number;
  pageSize: number;
}
export interface ProductPage {
  products: Product[];
  found: number;
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CartItem {
  key: string;
  quantity: number;
  subtotal: string;
  total: string;
  product: {
    databaseId: number;
    slug?: string | null;
    name: string;
    image: Product["image"];
    categoryIds: number[];
    attributes: { name: string; label: string; terms: { slug: string; name: string }[] }[];
  };
  variation: { databaseId?: number; attributes: { name: string; value: string }[] } | null;
}
export interface Cart { items: CartItem[]; subtotal: string }
export interface AddCartItem { productId: number; variationId?: number; quantity?: number }
export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
  company?: string;
}
export interface ShippingRate { id: string; label: string; cost: string; methodId?: string }
export interface PaymentGateway { id: string; title: string; description?: string | null; icon?: string | null }
export interface Checkout extends Cart {
  appliedCoupons: { code: string; discountAmount: string }[];
  shippingTotal: string;
  total: string;
  rawTotal: string;
  shippingRates: ShippingRate[];
  chosenShipping: string[];
  paymentGateways: PaymentGateway[];
  billing: CheckoutAddress | null;
  shipping: CheckoutAddress | null;
}
export interface PlaceOrderInput {
  acceptedTerms: boolean;
  expectedTotal: number;
  billing: Partial<CheckoutAddress> | null;
  shipping: CheckoutAddress | null;
  shippingMethods: string[];
  paymentMethod: string;
  parcelLocker?: string;
  invoiceRequested?: boolean;
  invoiceTaxId?: string;
}
export interface ConfirmedOrder { orderId: number; orderKey: string; needsPayment: boolean; redirectUrl?: string }
export type CheckoutResult =
  | ({ status: "completed" } & ConfirmedOrder)
  | { status: "rejected" | "pending"; message?: string };

export interface CommerceAdapter {
  products(filters: ProductFilters, after?: string | null): Promise<ProductPage>;
  cart(): Promise<Cart>;
  addItem(input: AddCartItem): Promise<void>;
  removeItems(keys: string[]): Promise<void>;
  updateQuantity(key: string, quantity: number): Promise<void>;
  checkout(): Promise<Checkout>;
  saveAddress(type: "billing" | "shipping", address: Partial<CheckoutAddress>): Promise<void>;
  selectShipping(ids: string[]): Promise<void>;
  applyCoupon(code: string): Promise<void>;
  removeCoupon(code: string): Promise<void>;
  placeOrder(input: PlaceOrderInput, requestId: string): Promise<CheckoutResult>;
  checkoutAttempt(requestId: string): Promise<CheckoutResult>;
}
