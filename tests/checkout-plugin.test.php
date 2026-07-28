<?php
/** Isolated contract tests; no WordPress installation or real orders/payments. */
namespace WPGraphQL\WooCommerce\Data\Mutation {
    class Checkout_Mutation {
        public static function prepare_checkout_args( $input, $context, $info ) {
            $GLOBALS['native_input'] = $input;
            return $input;
        }
        public static function process_checkout( $args, $input, $context, $info, &$result ) {
            $GLOBALS['engine_calls']++;
            if ( 'validation' === $GLOBALS['mode'] ) {
                $GLOBALS['notices'] = [ [ 'notice' => 'Nieprawidłowy adres.' ] ];
                throw new \RuntimeException( 'Validation' );
            }
            if ( 'unknown' === $GLOBALS['mode'] ) throw new \RuntimeException( 'Unknown failure' );
            $order = new \WC_Order( ++$GLOBALS['order_sequence'] );
            \do_action( 'woocommerce_checkout_create_order', $order );
            if ( 'creation_crash' === $GLOBALS['mode'] ) {
                $GLOBALS['notices'] = [ [ 'notice' => 'Creation failed' ] ];
                throw new \RuntimeException( 'Unknown creation outcome' );
            }
            $GLOBALS['orders'][$order->get_id()] = $order;
            \do_action( 'woocommerce_checkout_order_created', $order );
            if ( 'payment_error' === $GLOBALS['mode'] ) throw new \RuntimeException( 'Gateway timeout' );
            $result = [ 'result' => 'success', 'redirect' => 'https://payments.example/pay' ];
            return $order->get_id();
        }
    }
}
namespace GraphQL\Error { class UserError extends \RuntimeException {} }
namespace {
    define( 'ABSPATH', __DIR__ );
    $hooks = []; $options = []; $orders = []; $notices = []; $engine_calls = 0; $order_sequence = 0; $mode = 'success'; $user = 0; $guest = 'guest-a'; $registered_fields = [];
    class WC_Order {
        public array $meta = [];
        public function __construct( private int $id ) {}
        public function get_id() { return $this->id; }
        public function get_order_key() { return 'wc_test_' . $this->id; }
        public function needs_payment() { return true; }
        public function update_meta_data( $key, $value ) { $this->meta[$key] = $value; }
    }
    function add_action( $name, $callback, $priority = 10, $args = 1 ) { $GLOBALS['hooks'][$name][] = $callback; }
    function remove_action( $name, $callback, $priority = 10 ) { $GLOBALS['hooks'][$name] = array_filter( $GLOBALS['hooks'][$name] ?? [], fn( $item ) => $item !== $callback ); }
    function do_action( $name, ...$args ) { foreach ( $GLOBALS['hooks'][$name] ?? [] as $callback ) $callback( ...$args ); }
    function wp_salt( $type ) { return 'test-only-salt'; }
    function get_option( $key ) { return $GLOBALS['options'][$key] ?? false; }
    function add_option( $key, $value, ...$unused ) { if ( isset( $GLOBALS['options'][$key] ) ) return false; $GLOBALS['options'][$key] = $value; return true; }
    function update_option( $key, $value, ...$unused ) { $GLOBALS['options'][$key] = $value; }
    function delete_option( $key ) { unset( $GLOBALS['options'][$key] ); }
    function is_user_logged_in() { return $GLOBALS['user'] > 0; }
    function get_current_user_id() { return $GLOBALS['user']; }
    function wc_get_order( $id ) { return $GLOBALS['orders'][$id] ?? false; }
    function sanitize_text_field( $value ) { return strip_tags( $value ); }
    function wp_strip_all_tags( $value ) { return strip_tags( $value ); }
    function wc_get_notices( $type = '' ) { return $GLOBALS['notices']; }
    function wc_clear_notices() { $GLOBALS['notices'] = []; }
    function wc_get_logger() { return new class { public function error( ...$args ) {} }; }
    function register_graphql_object_type( ...$args ) {}
    function register_graphql_mutation( ...$args ) {}
    function register_graphql_field( $type, $name, $config ) { $GLOBALS['registered_fields'][$name] = $config; }
    function WC() {
        return new class {
            public $session; public $cart;
            public function __construct() {
                $this->session = new class {
                    public function get_customer_id() { return $GLOBALS['guest']; }
                    public function get( $key, $default = null ) { return $key === 'chosen_shipping_methods' ? ['flat_rate:1'] : $default; }
                };
                $this->cart = new class {
                    public function is_empty() { return false; }
                    public function calculate_totals() {}
                    public function get_total( $format ) { return '100.00'; }
                };
            }
            public function shipping() { return new class { public function get_packages() { return []; } }; }
        };
    }
    require __DIR__ . '/../wp-plugins/cd-checkout-graphql/cd-checkout-graphql.php';
    function check( $condition, $message ) { if ( ! $condition ) throw new \RuntimeException( $message ); echo "PASS: $message\n"; }
    function input( $number ) {
        return [ 'requestId' => sprintf( '00000000-0000-4000-8000-%012d', $number ), 'acceptedTerms' => true, 'expectedTotal' => 100,
            'checkout' => [ 'shippingMethod' => ['flat_rate:1'], 'paymentMethod' => 'test', 'billing' => [], 'isPaid' => true, 'fees' => ['bad'], 'metaData' => ['bad'] ] ];
    }
    $first = cd_checkout_run( input(1), null, null );
    $second = cd_checkout_run( input(1), null, null );
    check( $first['orderId'] === $second['orderId'] && $engine_calls === 1, 'retry returns the same order without running checkout/payment again' );
    check( ! array_intersect_key( $native_input, array_flip( ['isPaid', 'fees', 'metaData'] ) ), 'client cannot mark order paid or inject fees/metadata' );
    check( $orders[$first['orderId']]->meta['_cd_terms_accepted_at'] !== '', 'terms acceptance is recorded' );
    $mode = 'payment_error';
    $failed_payment = cd_checkout_run( input(2), null, null );
    $retry_payment = cd_checkout_run( input(2), null, null );
    check( $failed_payment['orderId'] === $retry_payment['orderId'] && $engine_calls === 2, 'gateway timeout preserves order and replay does not charge again' );
    $key = cd_checkout_request_key( 'guest:guest-a', input(3)['requestId'] );
    add_option( $key, ['status' => 'processing'] );
    check( cd_checkout_run( input(3), null, null )['status'] === 'pending' && $engine_calls === 2, 'concurrent attempt cannot run a second checkout' );
    $mode = 'validation';
    check( cd_checkout_run( input(4), null, null )['status'] === 'rejected', 'definitive validation failure allows correction' );
    $mode = 'success';
    check( cd_checkout_run( input(4), null, null )['status'] === 'completed', 'corrected request succeeds after definitive rejection' );
    $mode = 'creation_crash';
    check( cd_checkout_run( input(5), null, null )['status'] === 'pending', 'uncertain order creation remains locked even when notices exist' );
    $calls_before = $engine_calls;
    check( cd_checkout_run( input(5), null, null )['status'] === 'pending' && $engine_calls === $calls_before, 'uncertain creation is not automatically repeated' );
    $mismatch = input(6); $mismatch['expectedTotal'] = 1;
    check( cd_checkout_run( $mismatch, null, null )['status'] === 'rejected', 'changed total cannot be silently accepted' );
    $terms = input(7); $terms['acceptedTerms'] = false;
    check( cd_checkout_run( $terms, null, null )['status'] === 'rejected', 'terms acceptance is enforced by the backend' );
    do_action( 'graphql_register_types' );
    $resolver = $registered_fields['storeCheckoutStatus']['resolve'];
    $guest = 'guest-b';
    check( $resolver( null, ['requestId' => input(1)['requestId']] )['status'] === 'pending', 'another session cannot recover private order data' );
    $guest = 'guest-a';
    check( $resolver( null, ['requestId' => input(1)['requestId']] )['orderId'] === $first['orderId'], 'original session can recover completed order after reload' );
}
