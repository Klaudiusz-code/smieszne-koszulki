<?php
/**
 * Plugin Name: CD Odbiór osobisty dla użytkownika
 * Description: Dodaje metodę dostawy "Odbiór osobisty" tylko dla wskazanego użytkownika WooCommerce.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

const CD_USER_LOCAL_PICKUP_OPTION_USER_ID = 'cd_user_local_pickup_user_id';
const CD_USER_LOCAL_PICKUP_RATE_ID        = 'cd_user_local_pickup';
const CD_USER_LOCAL_PICKUP_RATE_LABEL     = 'Odbiór osobisty';

function cd_user_local_pickup_selected_user_id(): int {
    return absint( get_option( CD_USER_LOCAL_PICKUP_OPTION_USER_ID, 0 ) );
}

function cd_user_local_pickup_current_user_is_allowed(): bool {
    $selected_user_id = cd_user_local_pickup_selected_user_id();

    return $selected_user_id > 0 && get_current_user_id() === $selected_user_id;
}

function cd_user_local_pickup_settings_capability(): string {
    return class_exists( 'WooCommerce' ) ? 'manage_woocommerce' : 'manage_options';
}

add_action( 'admin_init', function (): void {
    register_setting( 'cd_user_local_pickup_settings', CD_USER_LOCAL_PICKUP_OPTION_USER_ID, [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0,
    ] );
} );

add_filter( 'option_page_capability_cd_user_local_pickup_settings', 'cd_user_local_pickup_settings_capability' );

add_action( 'admin_menu', function (): void {
    $capability = cd_user_local_pickup_settings_capability();

    if ( class_exists( 'WooCommerce' ) ) {
        add_submenu_page(
            'woocommerce',
            'Odbiór osobisty użytkownika',
            'Odbiór osobisty',
            $capability,
            'cd-user-local-pickup',
            'cd_user_local_pickup_render_settings_page'
        );

        return;
    }

    add_options_page(
        'Odbiór osobisty użytkownika',
        'Odbiór osobisty',
        $capability,
        'cd-user-local-pickup',
        'cd_user_local_pickup_render_settings_page'
    );
} );

function cd_user_local_pickup_render_settings_page(): void {
    if ( ! current_user_can( cd_user_local_pickup_settings_capability() ) ) {
        wp_die( esc_html__( 'Nie masz uprawnień do tej strony.', 'cd-user-local-pickup' ) );
    }

    $selected_user_id = cd_user_local_pickup_selected_user_id();
    $selected_user    = $selected_user_id ? get_userdata( $selected_user_id ) : null;
    ?>
    <div class="wrap">
        <h1>Odbiór osobisty dla użytkownika</h1>

        <?php if ( ! class_exists( 'WooCommerce' ) ) : ?>
            <div class="notice notice-warning">
                <p>WooCommerce nie jest aktywny. Metoda dostawy zacznie działać po włączeniu WooCommerce.</p>
            </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields( 'cd_user_local_pickup_settings' ); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="<?php echo esc_attr( CD_USER_LOCAL_PICKUP_OPTION_USER_ID ); ?>">Użytkownik</label>
                    </th>
                    <td>
                        <?php
                        wp_dropdown_users( [
                            'name'              => CD_USER_LOCAL_PICKUP_OPTION_USER_ID,
                            'id'                => CD_USER_LOCAL_PICKUP_OPTION_USER_ID,
                            'selected'          => $selected_user_id,
                            'show'              => 'display_name',
                            'show_option_none'  => 'Brak wybranego użytkownika',
                            'option_none_value' => '0',
                        ] );
                        ?>
                        <p class="description">
                            Metoda "Odbiór osobisty" pojawi się w koszyku i checkout tylko temu zalogowanemu użytkownikowi.
                        </p>

                        <?php if ( $selected_user instanceof WP_User ) : ?>
                            <p class="description">
                                Aktualnie wybrany: <strong><?php echo esc_html( $selected_user->display_name ); ?></strong>
                                (ID: <?php echo esc_html( (string) $selected_user->ID ); ?>,
                                <?php echo esc_html( $selected_user->user_email ); ?>)
                            </p>
                        <?php elseif ( $selected_user_id > 0 ) : ?>
                            <p class="description">
                                Zapisany użytkownik o ID <?php echo esc_html( (string) $selected_user_id ); ?> nie istnieje.
                            </p>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <?php submit_button( 'Zapisz ustawienia' ); ?>
        </form>
    </div>
    <?php
}

add_filter( 'woocommerce_cart_shipping_packages', function ( array $packages ): array {
    foreach ( $packages as &$package ) {
        $package['cd_user_local_pickup_user_id'] = cd_user_local_pickup_selected_user_id();
        $package['cd_user_local_pickup_allowed'] = cd_user_local_pickup_current_user_is_allowed() ? 1 : 0;
    }

    unset( $package );

    return $packages;
} );

add_filter( 'woocommerce_package_rates', function ( array $rates, array $package ): array {
    if ( ! cd_user_local_pickup_current_user_is_allowed() || ! class_exists( 'WC_Shipping_Rate' ) ) {
        unset( $rates[ CD_USER_LOCAL_PICKUP_RATE_ID ] );

        return $rates;
    }

    $rate = new WC_Shipping_Rate(
        CD_USER_LOCAL_PICKUP_RATE_ID,
        CD_USER_LOCAL_PICKUP_RATE_LABEL,
        0,
        [],
        CD_USER_LOCAL_PICKUP_RATE_ID
    );

    if ( method_exists( $rate, 'add_meta_data' ) ) {
        $rate->add_meta_data( '_cd_user_local_pickup', 'yes', true );
    }

    $rates[ CD_USER_LOCAL_PICKUP_RATE_ID ] = $rate;

    return $rates;
}, 100, 2 );
