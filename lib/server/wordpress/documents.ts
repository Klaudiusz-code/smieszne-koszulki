import "server-only";
import { commerceDocuments } from "@/packages/commerce/woocommerce/documents";
import { CartCountQueryDocument as CART_COUNT_QUERY } from "@/packages/commerce/woocommerce/generated";
import { SimilarCartProductsDocument as SIMILAR_CART_PRODUCTS_QUERY } from "@/packages/commerce/woocommerce/generated";
import { CartStatusQueryDocument as CART_STATUS_QUERY } from "@/lib/server/wordpress/generated";
import { WriteReviewDocument as WRITE_REVIEW_MUTATION } from "@/lib/server/wordpress/generated";
import { CheckoutShippingQueryDocument as CHECKOUT_SHIPPING_SUMMARY_QUERY } from "@/packages/commerce/woocommerce/generated";
import { OrderPaymentRedirectDocument as ORDER_PAY_MUTATION } from "@/packages/commerce/woocommerce/generated";
import { GetOrderReceivedDocument as ORDER_RECEIVED_QUERY } from "@/packages/commerce/woocommerce/generated";
import { CustomerAccountQueryDocument as CUSTOMER_ACCOUNT_QUERY } from "@/lib/server/wordpress/generated";
import { CustomerAddressesQueryDocument as CUSTOMER_ADDRESSES_QUERY } from "@/lib/server/wordpress/generated";
import { CustomerDownloadableItemsQueryDocument as CUSTOMER_DOWNLOADABLE_ITEMS_QUERY } from "@/lib/server/wordpress/generated";
import { CustomerOrdersQueryDocument as CUSTOMER_ORDERS_QUERY } from "@/lib/server/wordpress/generated";
import { UpdateAccountDocument as UPDATE_ACCOUNT_MUTATION } from "@/lib/server/wordpress/generated";
import { UpdateBillingAddressDocument as UPDATE_BILLING_ADDRESS_MUTATION, UpdateShippingAddressDocument as UPDATE_SHIPPING_ADDRESS_MUTATION } from "@/lib/server/wordpress/generated";

export const GRAPHQL_ALLOWLIST = {
  ...commerceDocuments,
  CartCountQuery: CART_COUNT_QUERY,
  CartStatusQuery: CART_STATUS_QUERY,
  SimilarCartProducts: SIMILAR_CART_PRODUCTS_QUERY,
  CheckoutShippingQuery: CHECKOUT_SHIPPING_SUMMARY_QUERY,
  GetOrderReceived: ORDER_RECEIVED_QUERY,
  OrderPaymentRedirect: ORDER_PAY_MUTATION,
  CustomerAccountQuery: CUSTOMER_ACCOUNT_QUERY,
  CustomerAddressesQuery: CUSTOMER_ADDRESSES_QUERY,
  CustomerDownloadableItemsQuery: CUSTOMER_DOWNLOADABLE_ITEMS_QUERY,
  CustomerOrdersQuery: CUSTOMER_ORDERS_QUERY,
  UpdateAccount: UPDATE_ACCOUNT_MUTATION,
  WriteReview: WRITE_REVIEW_MUTATION,
  UpdateBillingAddress: UPDATE_BILLING_ADDRESS_MUTATION,
  UpdateShippingAddress: UPDATE_SHIPPING_ADDRESS_MUTATION,
} as const;

export type GqlOperation = keyof typeof GRAPHQL_ALLOWLIST;

export type OperationResult<K extends GqlOperation> = import("@graphql-typed-document-node/core").ResultOf<(typeof GRAPHQL_ALLOWLIST)[K]>;
export type OperationVariables<K extends GqlOperation> = import("@graphql-typed-document-node/core").VariablesOf<(typeof GRAPHQL_ALLOWLIST)[K]>;
export type WordPressTransport = <K extends GqlOperation>(operation: K, variables: OperationVariables<K>) => Promise<import("@/packages/commerce/woocommerce/graphql").Envelope<OperationResult<K>>>;
