<?php
/**
 * Plugin Name: CD Order Received (WPGraphQL)
 * Description: Exposes a public orderByKey query for the order confirmation page. Validates orderId + orderKey before returning data.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'graphql_register_types', function (): void {

    // ── Line item type ────────────────────────────────────────────────────────

    register_graphql_object_type( 'OrderReceivedLineItem', [
        'description' => 'A single line item on the order confirmation.',
        'fields'      => [
            'name'     => [ 'type' => 'String', 'description' => 'Product name.' ],
            'quantity' => [ 'type' => 'Int',    'description' => 'Quantity ordered.' ],
        ],
    ] );

    // ── Order type ────────────────────────────────────────────────────────────

    register_graphql_object_type( 'OrderReceivedData', [
        'description' => 'Order data returned on the confirmation page.',
        'fields'      => [
            'databaseId'         => [ 'type' => 'Int',    'description' => 'WooCommerce order ID.' ],
            'orderNumber'        => [ 'type' => 'String', 'description' => 'Human-readable order number.' ],
            'status'             => [ 'type' => 'String', 'description' => 'Order status slug.' ],
            'date'               => [ 'type' => 'String', 'description' => 'ISO 8601 order date.' ],
            'subtotal'           => [ 'type' => 'String', 'description' => 'Subtotal formatted with currency symbol.' ],
            'shippingTotal'      => [ 'type' => 'String', 'description' => 'Shipping total formatted with currency symbol.' ],
            'total'              => [ 'type' => 'String', 'description' => 'Order total formatted with currency symbol.' ],
            'paymentMethodTitle'  => [ 'type' => 'String', 'description' => 'Human-readable payment method name.' ],
            'shippingMethodTitle' => [ 'type' => 'String', 'description' => 'Human-readable shipping method name.' ],
            'needsPayment'        => [ 'type' => 'Boolean','description' => 'Whether the order still requires payment.' ],
            'lineItems'          => [
                'type'        => [ 'list_of' => 'OrderReceivedLineItem' ],
                'description' => 'Products in this order.',
            ],
        ],
    ] );

    // ── Query field ───────────────────────────────────────────────────────────

    register_graphql_field( 'RootQuery', 'orderByKey', [
        'description' => 'Fetch a single order by database ID + order key. Requires both to match — no authentication needed.',
        'type'        => 'OrderReceivedData',
        'args'        => [
            'orderId'  => [ 'type' => [ 'non_null' => 'Int' ],    'description' => 'WooCommerce order database ID.' ],
            'orderKey' => [ 'type' => [ 'non_null' => 'String' ], 'description' => 'WooCommerce order key (wc_order_...).' ],
        ],
        'resolve'     => function ( $root, array $args ): ?array {
            $order_id  = (int) $args['orderId'];
            $order_key = sanitize_text_field( $args['orderKey'] );

            if ( $order_id <= 0 || $order_key === '' ) {
                return null;
            }

            $order = wc_get_order( $order_id );

            if ( ! $order instanceof WC_Order ) {
                return null;
            }

            // Constant-time comparison to prevent timing attacks.
            if ( ! hash_equals( $order->get_order_key(), $order_key ) ) {
                return null;
            }

            $line_items = [];
            foreach ( $order->get_items() as $item ) {
                /** @var WC_Order_Item_Product $item */
                $line_items[] = [
                    'name'     => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                ];
            }

            return [
                'databaseId'         => $order->get_id(),
                'orderNumber'        => $order->get_order_number(),
                'status'             => $order->get_status(),
                'date'               => $order->get_date_created()?->format( 'c' ) ?? null,
                'subtotal'           => wc_price( $order->get_subtotal() ),
                'shippingTotal'      => wc_price( (float) $order->get_shipping_total() ),
                'total'              => wc_price( (float) $order->get_total() ),
                'paymentMethodTitle'  => $order->get_payment_method_title() ?: null,
                'shippingMethodTitle' => array_values( $order->get_shipping_methods() )[0]?->get_name() ?: null,
                'needsPayment'        => $order->needs_payment(),
                'lineItems'          => $line_items,
            ];
        },
    ] );

} );
