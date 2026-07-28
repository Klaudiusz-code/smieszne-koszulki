<?php
/**
 * Plugin Name: CD Checkout (WPGraphQL)
 * Description: Validated headless checkout with persistent request deduplication.
 * Version: 1.0.0
 */
defined( 'ABSPATH' ) || exit;

/** The unique option name provides a DB-backed atomic claim, across PHP workers. */
function cd_checkout_request_key( string $owner, string $request_id ): string {
    return 'cd_checkout_' . hash_hmac( 'sha256', $owner . ':' . $request_id, wp_salt( 'auth' ) );
}

function cd_checkout_order_result( WC_Order $order, string $redirect = '' ): array {
    return [
        'status' => 'completed', 'orderId' => $order->get_id(),
        'orderKey' => $order->get_order_key(), 'needsPayment' => $order->needs_payment(),
        'redirectUrl' => $redirect, 'message' => '',
    ];
}

function cd_checkout_run( array $input, $context, $info ): array {
    $request_id = $input['requestId'] ?? '';
    if ( ! preg_match( '/^[a-f0-9-]{36}$/i', $request_id ) || ! WC()->session ) {
        throw new \GraphQL\Error\UserError( 'Nieprawidłowa próba zamówienia lub brak sesji.' );
    }
    $owner = is_user_logged_in() ? 'user:' . get_current_user_id() : 'guest:' . WC()->session->get_customer_id();
    $key = cd_checkout_request_key( $owner, $request_id );
    $existing = get_option( $key );
    if ( $existing ) {
        // Only a finished request can be replayed: do not race the payment gateway.
        if ( 'completed' === $existing['status'] && ! empty( $existing['order_id'] ) ) {
            $order = wc_get_order( $existing['order_id'] );
            if ( $order ) return cd_checkout_order_result( $order );
        }
        return [ 'status' => 'pending', 'message' => 'Trwa sprawdzanie wcześniejszej próby zamówienia. Sprawdź ponownie za chwilę. Jeśli komunikat się utrzymuje, skontaktuj się ze sklepem.' ];
    }
    if ( empty( $input['acceptedTerms'] ) ) {
        return [ 'status' => 'rejected', 'message' => 'Zaakceptuj regulamin sklepu.' ];
    }
    if ( ! WC()->cart || WC()->cart->is_empty() ) {
        return [ 'status' => 'rejected', 'message' => 'Koszyk jest pusty.' ];
    }
    $data = $input['checkout'] ?? [];
    // Never accept isPaid, transactionId, arbitrary fees, metadata or account creation from this surface.
    $data = array_intersect_key( $data, array_flip( [ 'billing', 'shipping', 'paymentMethod', 'shippingMethod' ] ) );
    $data['terms'] = true;
    $data['shipToDifferentAddress'] = true;
    $data['createdVia'] = 'headless-store';
    WC()->cart->calculate_totals();
    if ( ! isset( $input['expectedTotal'] ) || abs( (float) $input['expectedTotal'] - (float) WC()->cart->get_total( 'edit' ) ) > 0.005 ) {
        return [ 'status' => 'rejected', 'message' => 'Cena zamówienia uległa zmianie. Odśwież podsumowanie.' ];
    }
    $chosen = WC()->session->get( 'chosen_shipping_methods', [] );
    if ( ( $data['shippingMethod'] ?? [] ) !== $chosen ) {
        return [ 'status' => 'rejected', 'message' => 'Sposób dostawy uległ zmianie. Wybierz go ponownie.' ];
    }
    $needs_locker = false;
    foreach ( WC()->shipping()->get_packages() as $package ) {
        foreach ( $package['rates'] ?? [] as $id => $rate ) {
            if ( in_array( $id, $chosen, true ) && preg_match( '/paczkomat|parcel_machine|parcel_locker/i', $rate->get_method_id() ) ) $needs_locker = true;
        }
    }
    $point = sanitize_text_field( $input['parcelLocker'] ?? '' );
    if ( $needs_locker && ( ! preg_match( '/^[A-Za-z0-9_-]{2,64}$/', $point ) ) ) {
        return [ 'status' => 'rejected', 'message' => 'Wybierz poprawny paczkomat.' ];
    }
    // Configure against the installed carrier plugin; never guess its metadata contract.
    $point_key = defined( 'CD_INPOST_POINT_META_KEY' ) ? CD_INPOST_POINT_META_KEY : '';
    if ( $needs_locker && ! $point_key ) {
        return [ 'status' => 'rejected', 'message' => 'Dostawa do paczkomatu wymaga konfiguracji sklepu. Wybierz inną dostawę lub skontaktuj się ze sklepem.' ];
    }
    if ( ! add_option( $key, [ 'status' => 'processing', 'created_at' => time() ], '', false ) ) {
        return [ 'status' => 'pending', 'message' => 'Ta próba zamówienia jest już przetwarzana. Sprawdź ponownie za chwilę.' ];
    }
    $order_id = 0;
    $creation_started = false;
    $save_meta = static function ( $order ) use ( &$creation_started, $request_id, $input, $needs_locker, $point, $point_key ) {
        $creation_started = true;
        $order->update_meta_data( '_cd_checkout_request_id', $request_id );
        $order->update_meta_data( '_cd_terms_accepted_at', gmdate( 'c' ) );
        $order->update_meta_data( '_cd_invoice_requested', ! empty( $input['invoiceRequested'] ) ? 'yes' : 'no' );
        if ( ! empty( $input['invoiceTaxId'] ) ) {
            $order->update_meta_data( '_billing_nip', sanitize_text_field( $input['invoiceTaxId'] ) );
        }
        if ( $needs_locker ) {
            $order->update_meta_data( $point_key, $point );
            $order->update_meta_data( '_cd_parcel_locker', $point );
        }
    };
    $capture_order = static function ( $order ) use ( &$order_id, $key ) {
        $order_id = $order->get_id();
        update_option( $key, [ 'status' => 'processing', 'order_id' => $order_id, 'created_at' => time() ], false );
    };
    $validate_total = static function ( $posted, $errors ) use ( $input ) {
        // WooGraphQL recalculates shipping/tax after applying submitted addresses.
        if ( abs( (float) $input['expectedTotal'] - (float) WC()->cart->get_total( 'edit' ) ) > 0.005 ) {
            $errors->add( 'cd_total_changed', 'Cena zamówienia uległa zmianie. Odśwież podsumowanie.' );
        }
    };
    add_action( 'woocommerce_checkout_create_order', $save_meta, 20 );
    add_action( 'woocommerce_checkout_order_created', $capture_order, 1 );
    add_action( 'graphql_woocommerce_after_checkout_validation', $validate_total, 20, 2 );
    try {
        // Use the WooGraphQL engine directly; its higher-level resolver may purge an order on error.
        $class = '\WPGraphQL\WooCommerce\Data\Mutation\Checkout_Mutation';
        $args = $class::prepare_checkout_args( $data, $context, $info );
        do_action( 'graphql_woocommerce_before_checkout', $args, $data, $context, $info );
        $result = [];
        $order_id = $class::process_checkout( $args, $data, $context, $info, $result );
        $order = wc_get_order( $order_id );
        if ( ! $order ) throw new \RuntimeException( 'Missing order after checkout' );
        update_option( $key, [ 'status' => 'completed', 'order_id' => $order_id, 'created_at' => time() ], false );
        do_action( 'graphql_woocommerce_after_checkout', $order, $data, $context, $info );
        return cd_checkout_order_result( $order, 'success' === ( $result['result'] ?? '' ) ? ( $result['redirect'] ?? '' ) : '' );
    } catch ( \Throwable $error ) {
        if ( $order_id && ( $order = wc_get_order( $order_id ) ) ) {
            // Payment failure must not turn retry into a second order creation.
            update_option( $key, [ 'status' => 'completed', 'order_id' => $order_id, 'created_at' => time() ], false );
            return cd_checkout_order_result( $order );
        }
        // A crash without a captured order is intentionally NOT retried automatically.
        // A validation error before create_order is definitive and may be corrected.
        $notices = wc_get_notices( 'error' );
        if ( ! $creation_started && ! empty( $notices ) ) {
            delete_option( $key );
            return [ 'status' => 'rejected', 'message' => implode( ' ', array_map( static function ( $notice ) { return wp_strip_all_tags( $notice['notice'] ); }, $notices ) ) ];
        }
        wc_get_logger()->error( 'Checkout attempt requires reconciliation: ' . $key, [ 'source' => 'cd-checkout' ] );
        return [ 'status' => 'pending', 'message' => 'Nie udało się potwierdzić wyniku zamówienia. Skontaktuj się ze sklepem przed rozpoczęciem nowego zamówienia.' ];
    } finally {
        remove_action( 'woocommerce_checkout_create_order', $save_meta, 20 );
        remove_action( 'woocommerce_checkout_order_created', $capture_order, 1 );
        remove_action( 'graphql_woocommerce_after_checkout_validation', $validate_total, 20 );
        wc_clear_notices();
    }
}

add_action( 'graphql_register_types', static function () {
    $class = '\WPGraphQL\WooCommerce\Data\Mutation\Checkout_Mutation';
    if ( ! is_callable( [ $class, 'prepare_checkout_args' ] ) || ! is_callable( [ $class, 'process_checkout' ] ) ) return;
    $result_fields = [
        'status' => [ 'type' => 'String' ], 'message' => [ 'type' => 'String' ],
        'orderId' => [ 'type' => 'Int' ], 'orderKey' => [ 'type' => 'String' ],
        'needsPayment' => [ 'type' => 'Boolean' ], 'redirectUrl' => [ 'type' => 'String' ],
    ];
    register_graphql_object_type( 'StoreCheckoutResult', [ 'fields' => $result_fields ] );
    register_graphql_field( 'RootQuery', 'storeCheckoutStatus', [
        'type' => 'StoreCheckoutResult',
        'args' => [ 'requestId' => [ 'type' => [ 'non_null' => 'String' ] ] ],
        'resolve' => static function ( $root, $args ) {
            if ( ! WC()->session || ! preg_match( '/^[a-f0-9-]{36}$/i', $args['requestId'] ) ) return [ 'status' => 'pending' ];
            $owner = is_user_logged_in() ? 'user:' . get_current_user_id() : 'guest:' . WC()->session->get_customer_id();
            $existing = get_option( cd_checkout_request_key( $owner, $args['requestId'] ) );
            if ( $existing && 'completed' === $existing['status'] && ! empty( $existing['order_id'] ) ) {
                $order = wc_get_order( $existing['order_id'] );
                if ( $order ) return cd_checkout_order_result( $order );
            }
            // Missing record is also uncertain: the original request may still be in flight.
            return [ 'status' => 'pending', 'message' => 'Nie ma jeszcze potwierdzenia wyniku. Sprawdź ponownie za chwilę lub skontaktuj się ze sklepem.' ];
        },
    ] );
    register_graphql_mutation( 'storeCheckout', [
        'inputFields' => [
            'requestId' => [ 'type' => [ 'non_null' => 'String' ] ],
            'acceptedTerms' => [ 'type' => [ 'non_null' => 'Boolean' ] ],
            'expectedTotal' => [ 'type' => [ 'non_null' => 'Float' ] ],
            'checkout' => [ 'type' => [ 'non_null' => 'CheckoutInput' ] ],
            'parcelLocker' => [ 'type' => 'String' ],
            'invoiceRequested' => [ 'type' => 'Boolean' ],
            'invoiceTaxId' => [ 'type' => 'String' ],
        ],
        'outputFields' => $result_fields,
        'mutateAndGetPayload' => 'cd_checkout_run',
    ] );
} );
