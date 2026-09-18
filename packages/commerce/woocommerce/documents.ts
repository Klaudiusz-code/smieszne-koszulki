import { ProductsDocument as PRODUCTS_QUERY } from "./generated";
import { CartQueryDocument as CART_QUERY } from "./generated";
import { AddToCartDocument as ADD_TO_CART_MUTATION } from "./generated";
import { RemoveItemsFromCartDocument as REMOVE_ITEMS_FROM_CART_MUTATION } from "./generated";
import { UpdateItemQuantitiesDocument as UPDATE_ITEM_QUANTITIES_MUTATION } from "./generated";
import { CheckoutQueryDocument as CHECKOUT_QUERY } from "./generated";
import { UpdateCustomerDocument as UPDATE_CHECKOUT_CUSTOMER_MUTATION } from "./generated";
import { UpdateShippingMethodDocument as UPDATE_SHIPPING_METHOD_MUTATION } from "./generated";
import { ApplyCouponDocument as APPLY_COUPON_MUTATION } from "./generated";
import { RemoveCouponDocument as REMOVE_COUPON_MUTATION } from "./generated";
import { PlaceOrderDocument as PLACE_ORDER_MUTATION, CheckoutAttemptDocument as CHECKOUT_ATTEMPT_QUERY } from "./generated";
import type { ResultOf, VariablesOf, Envelope } from "./graphql";

/** Merge into a server-side allowlist. Do not accept arbitrary browser documents. */
export const commerceDocuments = {
  Products: PRODUCTS_QUERY, CartQuery: CART_QUERY, AddToCart: ADD_TO_CART_MUTATION,
  RemoveItemsFromCart: REMOVE_ITEMS_FROM_CART_MUTATION, UpdateItemQuantities: UPDATE_ITEM_QUANTITIES_MUTATION,
  CheckoutQuery: CHECKOUT_QUERY, UpdateCustomer: UPDATE_CHECKOUT_CUSTOMER_MUTATION,
  UpdateShippingMethod: UPDATE_SHIPPING_METHOD_MUTATION, ApplyCoupon: APPLY_COUPON_MUTATION,
  RemoveCoupon: REMOVE_COUPON_MUTATION, PlaceOrder: PLACE_ORDER_MUTATION, CheckoutAttempt: CHECKOUT_ATTEMPT_QUERY,
};
export type CommerceOperation = keyof typeof commerceDocuments;
export type OperationResult<K extends CommerceOperation> = ResultOf<(typeof commerceDocuments)[K]>;
export type OperationVariables<K extends CommerceOperation> = VariablesOf<(typeof commerceDocuments)[K]>;
export type OperationTransport = <K extends CommerceOperation>(operation: K, variables: OperationVariables<K>) => Promise<Envelope<OperationResult<K>>>;
