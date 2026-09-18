<?php
/**
 * Plugin Name: CD Order Pay (WPGraphQL)
 * Description: Adds an orderPaymentRedirect mutation to initiate payment for an existing pending order.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'graphql_register_types', function (): void {

    register_graphql_mutation( 'orderPaymentRedirect', [
        'inputFields'  => [
            'orderId'  => [ 'type' => [ 'non_null' => 'Int' ],    'description' => 'WooCommerce order database ID.' ],
            'orderKey' => [ 'type' => [ 'non_null' => 'String' ], 'description' => 'WooCommerce order key (wc_order_...).' ],
        ],
        'outputFields' => [
            'success'     => [ 'type' => 'Boolean', 'description' => 'Whether payment initiation succeeded.' ],
            'redirectUrl' => [ 'type' => 'String',  'description' => 'URL to redirect the customer to for payment.' ],
            'message'     => [ 'type' => 'String',  'description' => 'Error message if not successful.' ],
        ],
        'mutateAndGetPayload' => function ( array $input ): array {
            $order_id  = (int) ( $input['orderId']  ?? 0 );
            $order_key = sanitize_text_field( $input['orderKey'] ?? '' );

            if ( $order_id <= 0 || $order_key === '' ) {
                return [ 'success' => false, 'message' => 'Nieprawidłowe dane zamówienia.' ];
            }

            $order = wc_get_order( $order_id );

            if ( ! $order instanceof WC_Order ) {
                return [ 'success' => false, 'message' => 'Zamówienie nie istnieje.' ];
            }

            // Constant-time comparison to prevent timing attacks.
            if ( ! hash_equals( $order->get_order_key(), $order_key ) ) {
                return [ 'success' => false, 'message' => 'Nieprawidłowy klucz zamówienia.' ];
            }

            if ( ! $order->needs_payment() ) {
                return [ 'success' => false, 'message' => 'Zamówienie nie wymaga płatności.' ];
            }

            $gateway_id = $order->get_payment_method();

            WC()->payment_gateways()->init();
            $gateways = WC()->payment_gateways()->payment_gateways();

            if ( ! isset( $gateways[ $gateway_id ] ) ) {
                return [ 'success' => false, 'message' => 'Brak bramki płatniczej dla tego zamówienia.' ];
            }

            $gateway = $gateways[ $gateway_id ];

            if ( ! $gateway->is_available() ) {
                return [ 'success' => false, 'message' => 'Bramka płatnicza jest niedostępna.' ];
            }

            try {
                $result = $gateway->process_payment( $order_id );
            } catch ( Exception $e ) {
                wc_get_logger()->error(
                    'Order payment redirect failed: ' . $e->getMessage(),
                    [ 'source' => 'cd-order-pay-graphql', 'order_id' => $order_id ]
                );

                return [ 'success' => false, 'message' => 'Nie udało się zainicjować płatności.' ];
            }

            if ( isset( $result['result'] ) && $result['result'] === 'success' && ! empty( $result['redirect'] ) ) {
                return [ 'success' => true, 'redirectUrl' => $result['redirect'] ];
            }

            return [ 'success' => false, 'message' => 'Nie udało się zainicjować płatności.' ];
        },
    ] );

} );
