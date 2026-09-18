<?php
/**
 * Plugin Name: CD Reset Password URL
 * Description: Overrides the password reset link in WooCommerce/WordPress reset emails to point to the Next.js frontend (/resetuj-haslo).
 * Version: 1.1.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Intercept the email right before sending and swap any reset URL
 * (works with WooCommerce /moje-konto/lost-password/ and plain WP wp-login.php).
 */
add_filter( 'wp_mail', function ( array $args ): array {
    if ( empty( $args['message'] ) ) {
        return $args;
    }

    $args['message'] = preg_replace_callback(
        '/https?:\/\/\S+[?&]key=([^&\s"<>]+)(?:&amp;|&)login=([^&\s"<>"]+)/i',
        function ( array $m ): string {
            return add_query_arg(
                [
                    'key'   => rawurldecode( $m[1] ),
                    'login' => rawurldecode( $m[2] ),
                ],
                defined( 'CD_STOREFRONT_URL' ) ? trailingslashit( CD_STOREFRONT_URL ) . 'resetuj-haslo' : home_url( '/resetuj-haslo' )
            );
        },
        $args['message']
    );

    return $args;
} );
