import { AddToCartDocument, CartQueryDocument } from "../../packages/commerce/woocommerce/generated";
import { graphqlBody } from "../../packages/commerce/woocommerce/graphql";
import type { OperationTransport } from "../../packages/commerce/woocommerce/documents";

// Compiled by tsc; never executed. These checks fail if transport loses operation inference.
export async function checkGraphqlTypes(transport: OperationTransport) {
  graphqlBody(AddToCartDocument, { productId: 1, quantity: 2 });
  // @ts-expect-error required GraphQL variable
  graphqlBody(AddToCartDocument, {});
  // @ts-expect-error quantity is Int, not a string
  graphqlBody(AddToCartDocument, { productId: 1, quantity: "2" });
  // @ts-expect-error CartQuery declares no variables
  graphqlBody(CartQueryDocument, { customerId: 1 });
  const result = await transport("AddToCart", { productId: 1 });
  void result.data?.addToCart?.cart?.total;
  // @ts-expect-error subtotal was not selected by this operation
  void result.data?.addToCart?.cart?.subtotal;
  // @ts-expect-error ApplyCoupon requires a code
  await transport("ApplyCoupon", {});
  // @ts-expect-error no arbitrary operation names
  await transport("UnknownOperation", {});
}
