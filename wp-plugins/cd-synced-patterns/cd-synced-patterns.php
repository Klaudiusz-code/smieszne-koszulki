<?php
/**
 * Plugin Name: CD Synced Patterns
 * Description: Tworzy zsynchronizowane wzorce bloków (synced patterns) dla powtarzalnych sekcji opisów produktów.
 * Version: 1.13.0
 */

defined( 'ABSPATH' ) || exit;

const CD_SYNCED_PATTERNS_VERSION = '1.13.0';

// ---------------------------------------------------------------------------
// Definicje wzorców
// ---------------------------------------------------------------------------

function cd_synced_patterns_definitions(): array {
    return [
        [
            'slug'    => 'cd-warto-wiedziec',
            'title'   => 'CD: Kamienie naturalne',
            'label'   => 'Kamienie naturalne',
            'content' => '<!-- wp:paragraph -->
<p>Zdjęcia biżuterii są poglądowe. Bransoletki wykonane są z Kamieni Naturalnych, co sprawia, że biżuteria może różnić się od siebie kolorem, strukturą lub intensywnością barw. Drobne ubytki czy zarysowania kamieni są dziełem natury — nie są wadą. Każda bransoletka jest <strong>niepowtarzalna i unikatowa</strong>.</p>
<!-- /wp:paragraph -->',
        ],
        [
            'slug'    => 'cd-brak-zwrotu',
            'title'   => 'CD: Brak zwrotu (produkty personalizowane)',
            'label'   => 'Produkty personalizowane',
            'content' => '<!-- wp:paragraph -->
<p>Produkty personalizowane (wykonywane na zamówienie) — <strong>brak możliwości zwrotu</strong>.</p>
<!-- /wp:paragraph -->',
        ],
        [
            'slug'    => 'cd-opakowanie',
            'title'   => 'CD: Opakowanie',
            'label'   => 'Opakowanie',
            'content' => '<!-- wp:paragraph -->
<p>Bransoletka zapakowana w woreczek celofanowy lub pudełko — w zależności od wyboru kupującego.</p>
<!-- /wp:paragraph -->',
        ],
    ];
}

function cd_synced_patterns_get_definition( string $slug ): ?array {
    foreach ( cd_synced_patterns_definitions() as $pattern ) {
        if ( $pattern['slug'] === $slug ) {
            return $pattern;
        }
    }

    return null;
}

function cd_synced_patterns_block_name( string $slug ): string {
    return 'cd/' . preg_replace( '/^cd-/', '', $slug );
}

function cd_synced_patterns_block_markup( string $slug ): string {
    return '<!-- wp:' . cd_synced_patterns_block_name( $slug ) . ' /-->';
}

function cd_synced_patterns_block_names(): array {
    return array_map(
        fn( $pattern ) => cd_synced_patterns_block_name( $pattern['slug'] ),
        cd_synced_patterns_definitions()
    );
}

function cd_product_features_block_name(): string {
    return 'cd/product-features';
}

function cd_product_notes_block_name(): string {
    return 'cd/product-notes';
}

function cd_product_notes_options(): array {
    return [
        [
            'slug'  => 'cd-warto-wiedziec',
            'attr'  => 'showNaturalStones',
            'label' => 'Produkt',
        ],
        [
            'slug'  => 'cd-opakowanie',
            'attr'  => 'showPackaging',
            'label' => 'Opakowanie',
        ],
        [
            'slug'  => 'cd-brak-zwrotu',
            'attr'  => 'showPersonalizedReturns',
            'label' => 'Zwrot',
        ],
    ];
}

function cd_product_notes_block_attributes(): array {
    return [
        'showNaturalStones' => [
            'type'    => 'boolean',
            'default' => true,
        ],
        'showPackaging' => [
            'type'    => 'boolean',
            'default' => true,
        ],
        'showPersonalizedReturns' => [
            'type'    => 'boolean',
            'default' => true,
        ],
    ];
}

function cd_product_features_stone_taxonomy(): string {
    if ( function_exists( 'wc_attribute_taxonomy_name' ) ) {
        $taxonomy = wc_attribute_taxonomy_name( 'kamienie' );

        if ( taxonomy_exists( $taxonomy ) ) {
            return $taxonomy;
        }
    }

    return taxonomy_exists( 'pa_kamienie' ) ? 'pa_kamienie' : '';
}

function cd_product_features_stone_options(): array {
    $taxonomy = cd_product_features_stone_taxonomy();

    if ( ! $taxonomy ) {
        return [];
    }

    $terms = get_terms( [
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
        'orderby'    => 'name',
        'order'      => 'ASC',
    ] );

    if ( is_wp_error( $terms ) ) {
        return [];
    }

    return array_map(
        fn( $term ) => [
            'value' => $term->name,
            'label' => $term->name,
        ],
        $terms
    );
}

function cd_product_features_option_groups(): array {
    return [
        'sizes'  => [
            '4 mm',
            '6 mm',
            '8 mm',
            '4 mm, oliwka 8/6 mm',
            'ok. 4,5 mm do 3,5 mm',
            'ok. 6/3,5 mm',
        ],
        'cords'  => [
            'nylonowy, kolor różowy',
            'nylonowy, kolor czarny',
            'nylonowy, kolor beżowy',
            'nylonowy, kolor brązowy',
            'nić nylonowa, kolor czerwony',
            'nić nylonowa, kolor niebieski',
        ],
        'clasps' => [
            'regulowane, typu makrama',
            'regulowane, makrama',
            'regulowane, stoper z silikonem (stal chirurgiczna)',
            'przesuwne regulowane za pomocą stopera z silikonem',
        ],
        'lengths' => [
            'ok. 22 cm',
            'ok. 23 cm',
            'ok. 24 cm',
            'ok. 27 cm',
            'uniwersalny ok. 24 cm',
        ],
        'spacers' => [
            'stal chirurgiczna',
            'koraliki szklane, kolor złoty',
            'złote koraliki',
        ],
    ];
}

function cd_product_features_block_attributes(): array {
    return [
        'useProductStones' => [
            'type'    => 'boolean',
            'default' => true,
        ],
        'stones' => [
            'type'    => 'array',
            'default' => [],
            'items'   => [ 'type' => 'string' ],
        ],
        'stonesCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
        'sizePreset' => [
            'type'    => 'string',
            'default' => '',
        ],
        'sizeCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
        'cordPreset' => [
            'type'    => 'string',
            'default' => '',
        ],
        'cordCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
        'claspPreset' => [
            'type'    => 'string',
            'default' => '',
        ],
        'claspCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
        'lengthPreset' => [
            'type'    => 'string',
            'default' => '',
        ],
        'lengthCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
        'spacersPreset' => [
            'type'    => 'string',
            'default' => '',
        ],
        'spacersCustom' => [
            'type'    => 'string',
            'default' => '',
        ],
    ];
}

function cd_synced_patterns_get_post_id( string $slug ): ?int {
    $posts = get_posts( [
        'post_type'      => 'wp_block',
        'post_status'    => 'publish',
        'name'           => $slug,
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ] );

    return empty( $posts ) ? null : (int) $posts[0];
}

function cd_synced_patterns_synced_markup( string $slug ): string {
    $post_id = cd_synced_patterns_get_post_id( $slug );

    if ( $post_id ) {
        return '<!-- wp:block {"ref":' . $post_id . '} /-->';
    }

    $definition = cd_synced_patterns_get_definition( $slug );
    return $definition ? $definition['content'] : '';
}

function cd_synced_patterns_source_content( string $slug ): string {
    $post_id = cd_synced_patterns_get_post_id( $slug );

    if ( $post_id ) {
        $post = get_post( $post_id );

        if ( $post && $post->post_content ) {
            return $post->post_content;
        }
    }

    $definition = cd_synced_patterns_get_definition( $slug );
    return $definition ? $definition['content'] : '';
}

function cd_synced_patterns_wrap_rendered_content( string $slug, string $content ): string {
    if ( ! trim( $content ) ) {
        return '';
    }

    $definition = cd_synced_patterns_get_definition( $slug );
    $title      = $definition ? $definition['title'] : 'CD';
    $label      = $definition && isset( $definition['label'] ) ? $definition['label'] : $title;
    $modifier   = sanitize_html_class( preg_replace( '/^cd-/', '', $slug ) );

    return sprintf(
        '<section class="cd-synced-pattern cd-synced-pattern--%1$s" data-cd-pattern="%2$s" data-cd-label="%3$s" aria-label="%4$s">%5$s</section>',
        esc_attr( $modifier ),
        esc_attr( $slug ),
        esc_attr( $label ),
        esc_attr( $title ),
        $content
    );
}

function cd_synced_patterns_render_synced_markup( string $slug ): string {
    $content = cd_synced_patterns_source_content( $slug );
    return cd_synced_patterns_wrap_rendered_content( $slug, do_blocks( $content ) );
}

function cd_product_notes_items( array $attributes ): array {
    $items = [];

    foreach ( cd_product_notes_options() as $option ) {
        if ( isset( $attributes[ $option['attr'] ] ) && ! $attributes[ $option['attr'] ] ) {
            continue;
        }

        $label   = $option['label'];
        $content = do_blocks( cd_synced_patterns_source_content( $option['slug'] ) );

        if ( ! trim( $content ) ) {
            continue;
        }

        $items[] = [
            'slug'    => $option['slug'],
            'label'   => $label,
            'content' => $content,
        ];
    }

    return $items;
}

function cd_product_notes_render_block( array $attributes, string $content = '', $block = null ): string {
    $items = cd_product_notes_items( $attributes );

    if ( empty( $items ) ) {
        return '';
    }

    $html = '<section class="cd-product-notes" aria-label="Warto wiedzieć">';
    $html .= '<h3 class="cd-product-notes__title">Warto wiedzieć</h3>';
    $html .= '<div class="cd-product-notes__list">';

    foreach ( $items as $item ) {
        $html .= '<article class="cd-product-notes__item cd-product-notes__item--' . esc_attr( sanitize_html_class( preg_replace( '/^cd-/', '', $item['slug'] ) ) ) . '">';
        $html .= '<h4 class="cd-product-notes__item-title">' . esc_html( $item['label'] ) . '</h4>';
        $html .= '<div class="cd-product-notes__content">' . $item['content'] . '</div>';
        $html .= '</article>';
    }

    $html .= '</div>';
    $html .= '</section>';

    return $html;
}

function cd_product_features_current_product_id( $block = null ): int {
    if ( is_object( $block ) && isset( $block->context['postId'] ) ) {
        return (int) $block->context['postId'];
    }

    global $post;

    if ( $post instanceof WP_Post && $post->post_type === 'product' ) {
        return (int) $post->ID;
    }

    return get_the_ID() ? (int) get_the_ID() : 0;
}

function cd_product_features_product_stones( int $product_id ): array {
    $taxonomy = cd_product_features_stone_taxonomy();

    if ( ! $taxonomy || ! $product_id ) {
        return [];
    }

    $terms = get_the_terms( $product_id, $taxonomy );

    if ( empty( $terms ) || is_wp_error( $terms ) ) {
        return [];
    }

    return array_values( array_unique( array_map( fn( $term ) => $term->name, $terms ) ) );
}

function cd_product_features_clean_list( $values ): array {
    if ( ! is_array( $values ) ) {
        return [];
    }

    return array_values( array_filter( array_map( 'sanitize_text_field', $values ) ) );
}

function cd_product_features_attr_value( array $attributes, string $preset_key, string $custom_key ): string {
    $custom = isset( $attributes[ $custom_key ] ) ? trim( sanitize_text_field( $attributes[ $custom_key ] ) ) : '';

    if ( $custom !== '' ) {
        return $custom;
    }

    $preset = isset( $attributes[ $preset_key ] ) ? trim( sanitize_text_field( $attributes[ $preset_key ] ) ) : '';
    return $preset === '__custom' ? '' : $preset;
}

function cd_product_features_rows( array $attributes, int $product_id = 0 ): array {
    $use_product_stones = $attributes['useProductStones'] ?? true;
    $stones             = $use_product_stones ? cd_product_features_product_stones( $product_id ) : [];

    if ( empty( $stones ) ) {
        $stones = cd_product_features_clean_list( $attributes['stones'] ?? [] );
    }

    $stones_custom = isset( $attributes['stonesCustom'] ) ? trim( sanitize_text_field( $attributes['stonesCustom'] ) ) : '';

    if ( $stones_custom !== '' ) {
        $stones[] = $stones_custom;
    }

    $rows = [
        'Kamienie'   => implode( ', ', array_values( array_unique( array_filter( $stones ) ) ) ),
        'Rozmiar'    => cd_product_features_attr_value( $attributes, 'sizePreset', 'sizeCustom' ),
        'Sznurek'    => cd_product_features_attr_value( $attributes, 'cordPreset', 'cordCustom' ),
        'Zapięcie'   => cd_product_features_attr_value( $attributes, 'claspPreset', 'claspCustom' ),
        'Długość'    => cd_product_features_attr_value( $attributes, 'lengthPreset', 'lengthCustom' ),
        'Przekładki' => cd_product_features_attr_value( $attributes, 'spacersPreset', 'spacersCustom' ),
    ];

    return array_filter( $rows, fn( $value ) => trim( (string) $value ) !== '' );
}

function cd_product_features_render_block( array $attributes, string $content = '', $block = null ): string {
    $product_id = cd_product_features_current_product_id( $block );
    $rows       = cd_product_features_rows( $attributes, $product_id );

    if ( empty( $rows ) ) {
        return '';
    }

    $html = '<section class="cd-product-features" aria-label="Cechy produktu">';
    $html .= '<h3 class="cd-product-features__title">Cechy produktu</h3>';
    $html .= '<dl class="cd-product-features__list">';

    foreach ( $rows as $label => $value ) {
        $html .= '<div class="cd-product-features__row">';
        $html .= '<dt>' . esc_html( $label ) . '</dt>';
        $html .= '<dd>' . esc_html( $value ) . '</dd>';
        $html .= '</div>';
    }

    $html .= '</dl>';
    $html .= '</section>';

    return $html;
}

// ---------------------------------------------------------------------------
// Tworzenie wzorców (idempotentne — nie duplikuje przy kolejnych aktywacjach)
// ---------------------------------------------------------------------------

function cd_synced_patterns_create(): void {
    foreach ( cd_synced_patterns_definitions() as $pattern ) {
        if ( cd_synced_patterns_get_post_id( $pattern['slug'] ) ) {
            continue;
        }

        $post_id = wp_insert_post( [
            'post_type'    => 'wp_block',
            'post_status'  => 'publish',
            'post_name'    => $pattern['slug'],
            'post_title'   => $pattern['title'],
            'post_content' => $pattern['content'],
        ] );

        // Brak meta 'wp_pattern_sync_status' = wzorzec zsynchronizowany (domyślne zachowanie WP 6.3+)
        // Gdyby wzorzec miał być niezsynchronizowany: update_post_meta( $post_id, 'wp_pattern_sync_status', 'unsynced' );
    }
}

function cd_synced_patterns_sync_from_plugin(): array {
    $result = [
        'created'   => 0,
        'updated'   => 0,
        'unchanged' => 0,
        'failed'    => 0,
    ];

    foreach ( cd_synced_patterns_definitions() as $pattern ) {
        $post_id = cd_synced_patterns_get_post_id( $pattern['slug'] );

        if ( ! $post_id ) {
            $created_id = wp_insert_post( [
                'post_type'    => 'wp_block',
                'post_status'  => 'publish',
                'post_name'    => $pattern['slug'],
                'post_title'   => $pattern['title'],
                'post_content' => $pattern['content'],
            ], true );

            if ( is_wp_error( $created_id ) || ! $created_id ) {
                $result['failed']++;
            } else {
                $result['created']++;
            }

            continue;
        }

        $post = get_post( $post_id );

        if (
            $post
            && $post->post_title === $pattern['title']
            && $post->post_content === $pattern['content']
            && $post->post_status === 'publish'
            && get_post_meta( $post_id, 'wp_pattern_sync_status', true ) !== 'unsynced'
        ) {
            $result['unchanged']++;
            continue;
        }

        $updated_id = wp_update_post( [
            'ID'           => $post_id,
            'post_type'    => 'wp_block',
            'post_status'  => 'publish',
            'post_name'    => $pattern['slug'],
            'post_title'   => $pattern['title'],
            'post_content' => $pattern['content'],
        ], true );

        if ( is_wp_error( $updated_id ) || ! $updated_id ) {
            $result['failed']++;
            continue;
        }

        delete_post_meta( $post_id, 'wp_pattern_sync_status' );
        $result['updated']++;
    }

    return $result;
}

register_activation_hook( __FILE__, 'cd_synced_patterns_create' );

add_action( 'init', 'cd_synced_patterns_create', 5 );

// ---------------------------------------------------------------------------
// Rejestracja wzorców i bloków w inserterze
// ---------------------------------------------------------------------------

add_action( 'init', function () {
    register_block_pattern_category( 'cd-produkty', [ 'label' => 'CD Produkty' ] );

    foreach ( cd_synced_patterns_definitions() as $pattern ) {
        $pattern_content = cd_synced_patterns_block_markup( $pattern['slug'] );

        register_block_pattern( 'cd/' . $pattern['slug'], [
            'title'      => $pattern['title'],
            'categories' => [ 'cd-produkty' ],
            'content'    => $pattern_content,
            'postTypes'  => [ 'post', 'page', 'product' ],
            'source'     => 'plugin',
            'inserter'   => false,
        ] );

        register_block_type( cd_synced_patterns_block_name( $pattern['slug'] ), [
            'api_version'     => 2,
            'title'           => $pattern['title'],
            'category'        => 'cd-produkty',
            'icon'            => 'saved',
            'description'     => 'Zsynchronizowana sekcja opisu produktu CD.',
            'supports'        => [
                'customClassName' => false,
                'html'            => false,
                'inserter'        => false,
                'reusable'        => false,
            ],
            'render_callback' => fn() => cd_synced_patterns_render_synced_markup( $pattern['slug'] ),
        ] );
    }

    register_block_type( cd_product_features_block_name(), [
        'api_version'     => 2,
        'title'           => 'CD: Cechy produktu',
        'category'        => 'cd-produkty',
        'icon'            => 'list-view',
        'description'     => 'Tabela cech produktu z wyborami i kamieniami z atrybutu WooCommerce.',
        'attributes'      => cd_product_features_block_attributes(),
        'uses_context'    => [ 'postId' ],
        'supports'        => [
            'customClassName' => false,
            'html'            => false,
            'reusable'        => false,
        ],
        'render_callback' => 'cd_product_features_render_block',
    ] );

    register_block_type( cd_product_notes_block_name(), [
        'api_version'     => 2,
        'title'           => 'CD: Notka produktu',
        'category'        => 'cd-produkty',
        'icon'            => 'info-outline',
        'description'     => 'Jedna notka produktu z wyborem sekcji do pokazania.',
        'attributes'      => cd_product_notes_block_attributes(),
        'supports'        => [
            'customClassName' => false,
            'html'            => false,
            'reusable'        => false,
        ],
        'render_callback' => 'cd_product_notes_render_block',
    ] );
} );

add_filter( 'block_categories_all', function ( array $categories ): array {
    foreach ( $categories as $category ) {
        if ( isset( $category['slug'] ) && $category['slug'] === 'cd-produkty' ) {
            return $categories;
        }
    }

    array_unshift( $categories, [
        'slug'  => 'cd-produkty',
        'title' => 'CD Produkty',
        'icon'  => null,
    ] );

    return $categories;
}, 10, 2 );

add_filter( 'block_categories', function ( array $categories ): array {
    foreach ( $categories as $category ) {
        if ( isset( $category['slug'] ) && $category['slug'] === 'cd-produkty' ) {
            return $categories;
        }
    }

    array_unshift( $categories, [
        'slug'  => 'cd-produkty',
        'title' => 'CD Produkty',
        'icon'  => null,
    ] );

    return $categories;
}, 10, 2 );

function cd_synced_patterns_is_product_context( $context ): bool {
    if ( is_object( $context ) && isset( $context->post ) && is_object( $context->post ) ) {
        return isset( $context->post->post_type ) && $context->post->post_type === 'product';
    }

    if ( is_object( $context ) && isset( $context->post_type ) ) {
        return $context->post_type === 'product';
    }

    if ( is_admin() && function_exists( 'get_current_screen' ) ) {
        $screen = get_current_screen();
        return $screen && isset( $screen->post_type ) && $screen->post_type === 'product';
    }

    return false;
}

function cd_synced_patterns_allow_product_blocks( $allowed_block_types, $context ) {
    if ( ! cd_synced_patterns_is_product_context( $context ) ) {
        return $allowed_block_types;
    }

    $required_blocks = array_merge( [ 'core/block', cd_product_features_block_name(), cd_product_notes_block_name() ], cd_synced_patterns_block_names() );

    if ( true === $allowed_block_types ) {
        return $allowed_block_types;
    }

    if ( false === $allowed_block_types || ! is_array( $allowed_block_types ) ) {
        return $required_blocks;
    }

    return array_values( array_unique( array_merge( $allowed_block_types, $required_blocks ) ) );
}

add_filter( 'allowed_block_types_all', 'cd_synced_patterns_allow_product_blocks', 20, 2 );
add_filter( 'allowed_block_types', 'cd_synced_patterns_allow_product_blocks', 20, 2 );

add_filter( 'render_block_core/block', function ( string $block_content, array $block ): string {
    $ref = isset( $block['attrs']['ref'] ) ? (int) $block['attrs']['ref'] : 0;

    if ( ! $ref || strpos( $block_content, 'cd-synced-pattern' ) !== false ) {
        return $block_content;
    }

    foreach ( cd_synced_patterns_definitions() as $pattern ) {
        if ( cd_synced_patterns_get_post_id( $pattern['slug'] ) === $ref ) {
            return cd_synced_patterns_wrap_rendered_content( $pattern['slug'], $block_content );
        }
    }

    return $block_content;
}, 10, 2 );

function cd_product_features_editor_config(): array {
    $product_id = cd_product_features_current_product_id();

    return [
        'blockName'            => cd_product_features_block_name(),
        'stoneOptions'         => cd_product_features_stone_options(),
        'currentProductStones' => cd_product_features_product_stones( $product_id ),
        'optionGroups'         => cd_product_features_option_groups(),
    ];
}

function cd_product_notes_editor_config(): array {
    return [
        'blockName'    => cd_product_notes_block_name(),
        'options'      => cd_product_notes_options(),
        'previewItems' => cd_product_notes_items( [] ),
    ];
}

function cd_synced_patterns_editor_items(): array {
    return array_map(
        fn( $pattern ) => [
            'patternName' => 'cd/' . $pattern['slug'],
            'blockName'   => cd_synced_patterns_block_name( $pattern['slug'] ),
            'title'       => $pattern['title'],
            'content'     => cd_synced_patterns_block_markup( $pattern['slug'] ),
            'preview'     => cd_synced_patterns_render_synced_markup( $pattern['slug'] ),
        ],
        cd_synced_patterns_definitions()
    );
}

function cd_synced_patterns_editor_js(): string {
    $items          = wp_json_encode( cd_synced_patterns_editor_items() );
    $feature_config = wp_json_encode( cd_product_features_editor_config() );
    $notes_config   = wp_json_encode( cd_product_notes_editor_config() );

    return <<<JS
( function() {
    var items = {$items};
    var productFeatures = {$feature_config};
    var productNotes = {$notes_config};
    var categorySlug = 'cd-produkty';
    var categoryTitle = 'CD Produkty';
    window.cdSyncedPatternsRegisteredBlocks = window.cdSyncedPatternsRegisteredBlocks || {};
    window.cdProductFeaturesRegistered = window.cdProductFeaturesRegistered || false;
    window.cdProductNotesRegistered = window.cdProductNotesRegistered || false;

    function ensureCategory() {
        if ( ! wp.blocks.getCategories || ! wp.blocks.setCategories ) {
            return;
        }

        var categories = wp.blocks.getCategories();
        var exists = categories.some( function( category ) {
            return category.slug === categorySlug;
        } );

        if ( ! exists ) {
            wp.blocks.setCategories( [ { slug: categorySlug, title: categoryTitle, icon: null } ].concat( categories ) );
        }
    }

    function registerPatterns() {
        if ( ! wp.blocks.registerBlockPattern ) {
            return;
        }

        if ( wp.blocks.registerBlockPatternCategory ) {
            try {
                wp.blocks.registerBlockPatternCategory( categorySlug, { label: categoryTitle } );
            } catch ( e ) {}
        }

        items.forEach( function( item ) {
            if ( wp.blocks.getBlockPattern && wp.blocks.getBlockPattern( item.patternName ) ) {
                return;
            }

            try {
                wp.blocks.registerBlockPattern( item.patternName, {
                    title:      item.title,
                    categories: [ categorySlug ],
                    content:    item.content,
                    postTypes:  [ 'post', 'page', 'product' ],
                    source:     'plugin',
                    inserter:   false
                } );
            } catch ( e ) {}
        } );
    }

    function selectOptions( values ) {
        return [ { label: 'Nie pokazuj', value: '' } ].concat(
            ( values || [] ).map( function( value ) {
                return { label: value, value: value };
            } ),
            [ { label: 'Własna wartość', value: '__custom' } ]
        );
    }

    function textValue( attrs, presetKey, customKey ) {
        if ( attrs[ customKey ] ) {
            return attrs[ customKey ];
        }

        return attrs[ presetKey ] === '__custom' ? '' : ( attrs[ presetKey ] || '' );
    }

    function stonesValue( attrs ) {
        var values = [];

        if ( attrs.useProductStones !== false && productFeatures.currentProductStones && productFeatures.currentProductStones.length ) {
            values = productFeatures.currentProductStones.slice();
        } else if ( Array.isArray( attrs.stones ) ) {
            values = attrs.stones.slice();
        }

        if ( attrs.stonesCustom ) {
            values.push( attrs.stonesCustom );
        }

        return values.filter( Boolean ).filter( function( value, index, self ) {
            return self.indexOf( value ) === index;
        } ).join( ', ' );
    }

    function productFeatureRows( attrs ) {
        var rows = [
            [ 'Kamienie', stonesValue( attrs ) ],
            [ 'Rozmiar', textValue( attrs, 'sizePreset', 'sizeCustom' ) ],
            [ 'Sznurek', textValue( attrs, 'cordPreset', 'cordCustom' ) ],
            [ 'Zapięcie', textValue( attrs, 'claspPreset', 'claspCustom' ) ],
            [ 'Długość', textValue( attrs, 'lengthPreset', 'lengthCustom' ) ],
            [ 'Przekładki', textValue( attrs, 'spacersPreset', 'spacersCustom' ) ]
        ];

        return rows.filter( function( row ) {
            return row[1] && String( row[1] ).trim();
        } );
    }

    function productFeaturesPreview( attrs ) {
        var el = wp.element.createElement;
        var rows = productFeatureRows( attrs );

        if ( ! rows.length ) {
            return el( 'section', {
                className: 'cd-product-features cd-product-features--empty',
            },
                el( 'h3', { className: 'cd-product-features__title' }, 'Cechy produktu' ),
                el( 'p', null, 'Wybierz cechy produktu w ustawieniach bloku.' )
            );
        }

        return el( 'section', {
            className: 'cd-product-features',
        },
            el( 'h3', { className: 'cd-product-features__title' }, 'Cechy produktu' ),
            el( 'dl', { className: 'cd-product-features__list' }, rows.map( function( row ) {
                return el( 'div', { className: 'cd-product-features__row', key: row[0] },
                    el( 'dt', null, row[0] ),
                    el( 'dd', null, row[1] )
                );
            } ) )
        );
    }

    function productNoteItems( attrs ) {
        var options = productNotes.options || [];
        var previewItems = productNotes.previewItems || [];

        return options.map( function( option ) {
            if ( attrs[ option.attr ] === false ) {
                return null;
            }

            var preview = previewItems.find( function( item ) {
                return item.slug === option.slug;
            } ) || {};

            return {
                slug: option.slug,
                label: preview.label || option.label,
                content: preview.content || ''
            };
        } ).filter( function( item ) {
            return item && item.content;
        } );
    }

    function productNotesPreview( attrs ) {
        var el = wp.element.createElement;
        var notes = productNoteItems( attrs || {} );

        if ( ! notes.length ) {
            return el( 'section', {
                className: 'cd-product-notes cd-product-notes--empty',
            },
                el( 'h3', { className: 'cd-product-notes__title' }, 'Warto wiedzieć' ),
                el( 'p', null, 'Zaznacz przynajmniej jedną sekcję notki.' )
            );
        }

        return el( 'section', {
            className: 'cd-product-notes',
        },
            el( 'h3', { className: 'cd-product-notes__title' }, 'Warto wiedzieć' ),
            el( 'div', { className: 'cd-product-notes__list' }, notes.map( function( item ) {
                return el( 'article', {
                    className: 'cd-product-notes__item',
                    key: item.slug
                },
                    el( 'h4', { className: 'cd-product-notes__item-title' }, item.label ),
                    el( 'div', {
                        className: 'cd-product-notes__content',
                        dangerouslySetInnerHTML: { __html: item.content }
                    } )
                );
            } ) )
        );
    }

    function registerProductNotesBlock() {
        if ( ! wp.blocks.registerBlockType || ! wp.element ) {
            return false;
        }

        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var components = wp.components || {};
        var CheckboxControl = components.CheckboxControl;

        if ( ! CheckboxControl ) {
            return true;
        }

        if ( window.cdProductNotesRegistered && wp.blocks.getBlockType && wp.blocks.getBlockType( productNotes.blockName ) ) {
            return true;
        }

        if ( wp.blocks.getBlockType && wp.blocks.getBlockType( productNotes.blockName ) && wp.blocks.unregisterBlockType ) {
            try {
                wp.blocks.unregisterBlockType( productNotes.blockName );
            } catch ( e ) {}
        }

        ensureCategory();

        function setAttr( props, name, value ) {
            var update = {};
            update[ name ] = value;
            props.setAttributes( update );
        }

        try {
            wp.blocks.registerBlockType( productNotes.blockName, {
                apiVersion: 2,
                title: 'CD: Notka produktu',
                category: categorySlug,
                icon: 'info-outline',
                description: 'Jedna notka produktu z wyborem sekcji do pokazania.',
                attributes: {
                    showNaturalStones: { type: 'boolean', default: true },
                    showPackaging: { type: 'boolean', default: true },
                    showPersonalizedReturns: { type: 'boolean', default: true }
                },
                edit: function( props ) {
                    var attrs = props.attributes || {};

                    return el( Fragment, null,
                        el( 'div', { className: 'cd-product-notes-editor' },
                            el( 'div', { className: 'cd-product-notes-editor__controls' },
                                ( productNotes.options || [] ).map( function( option ) {
                                    return el( CheckboxControl, {
                                        key: option.attr,
                                        label: option.label,
                                        checked: attrs[ option.attr ] !== false,
                                        onChange: function( value ) {
                                            setAttr( props, option.attr, Boolean( value ) );
                                        }
                                    } );
                                } )
                            ),
                            productNotesPreview( attrs )
                        )
                    );
                },
                save: function() {
                    return null;
                }
            } );
            window.cdProductNotesRegistered = true;
        } catch ( e ) {}

        return true;
    }

    function registerProductFeaturesBlock() {
        if ( ! wp.blocks.registerBlockType || ! wp.element ) {
            return false;
        }

        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var components = wp.components || {};
        var CheckboxControl = components.CheckboxControl;
        var SelectControl = components.SelectControl;
        var TextControl = components.TextControl;

        if ( ! CheckboxControl || ! SelectControl || ! TextControl ) {
            return true;
        }

        if ( window.cdProductFeaturesRegistered && wp.blocks.getBlockType && wp.blocks.getBlockType( productFeatures.blockName ) ) {
            return true;
        }

        if ( wp.blocks.getBlockType && wp.blocks.getBlockType( productFeatures.blockName ) && wp.blocks.unregisterBlockType ) {
            try {
                wp.blocks.unregisterBlockType( productFeatures.blockName );
            } catch ( e ) {}
        }

        ensureCategory();

        function setAttr( props, name, value ) {
            var update = {};
            update[ name ] = value;
            props.setAttributes( update );
        }

        function selectField( props, label, presetKey, customKey, values ) {
            var attrs = props.attributes || {};
            var controls = [
                el( SelectControl, {
                    key: presetKey,
                    label: label,
                    value: attrs[ presetKey ] || '',
                    options: selectOptions( values ),
                    onChange: function( value ) {
                        setAttr( props, presetKey, value );
                        if ( value !== '__custom' ) {
                            setAttr( props, customKey, '' );
                        }
                    }
                } )
            ];

            if ( attrs[ presetKey ] === '__custom' || attrs[ customKey ] ) {
                controls.push( el( TextControl, {
                    key: customKey,
                    label: label + ' - własna wartość',
                    value: attrs[ customKey ] || '',
                    onChange: function( value ) {
                        setAttr( props, customKey, value );
                    }
                } ) );
            }

            return el( 'div', { className: 'cd-product-features-editor__field', key: presetKey }, controls );
        }

        function stonesField( props ) {
            var attrs = props.attributes || {};
            var selected = Array.isArray( attrs.stones ) ? attrs.stones : [];
            var options = productFeatures.stoneOptions || [];
            var controls = [
                el( CheckboxControl, {
                    key: 'use-product-stones',
                    label: 'Bierz kamienie z atrybutu produktu',
                    checked: attrs.useProductStones !== false,
                    onChange: function( value ) {
                        setAttr( props, 'useProductStones', Boolean( value ) );
                    }
                } )
            ];

            if ( attrs.useProductStones !== false ) {
                controls.push( el( 'p', { key: 'current-stones', className: 'cd-product-features-editor__hint' },
                    productFeatures.currentProductStones && productFeatures.currentProductStones.length
                        ? 'Aktualnie: ' + productFeatures.currentProductStones.join( ', ' )
                        : 'Ten produkt nie ma jeszcze kamieni w atrybucie pa_kamienie.'
                ) );
            } else {
                controls.push( el( 'div', { key: 'stone-options', className: 'cd-product-features-editor__stones' },
                    options.length
                        ? options.map( function( option ) {
                            return el( CheckboxControl, {
                                key: option.value,
                                label: option.label,
                                checked: selected.indexOf( option.value ) !== -1,
                                onChange: function( checked ) {
                                    var next = checked
                                        ? selected.concat( [ option.value ] )
                                        : selected.filter( function( value ) { return value !== option.value; } );
                                    setAttr( props, 'stones', next );
                                }
                            } );
                        } )
                        : el( 'p', { className: 'cd-product-features-editor__hint' }, 'Brak terminów w atrybucie pa_kamienie.' )
                ) );
            }

            controls.push( el( TextControl, {
                key: 'stones-custom',
                label: 'Kamienie - własna wartość',
                value: attrs.stonesCustom || '',
                onChange: function( value ) {
                    setAttr( props, 'stonesCustom', value );
                }
            } ) );

            return el( 'div', { className: 'cd-product-features-editor__field cd-product-features-editor__field--stones' }, controls );
        }

        try {
            wp.blocks.registerBlockType( productFeatures.blockName, {
                apiVersion: 2,
                title: 'CD: Cechy produktu',
                category: categorySlug,
                icon: 'list-view',
                description: 'Tabela cech produktu z wyborami i kamieniami z atrybutu WooCommerce.',
                attributes: {
                    useProductStones: { type: 'boolean', default: true },
                    stones: { type: 'array', default: [] },
                    stonesCustom: { type: 'string', default: '' },
                    sizePreset: { type: 'string', default: '' },
                    sizeCustom: { type: 'string', default: '' },
                    cordPreset: { type: 'string', default: '' },
                    cordCustom: { type: 'string', default: '' },
                    claspPreset: { type: 'string', default: '' },
                    claspCustom: { type: 'string', default: '' },
                    lengthPreset: { type: 'string', default: '' },
                    lengthCustom: { type: 'string', default: '' },
                    spacersPreset: { type: 'string', default: '' },
                    spacersCustom: { type: 'string', default: '' }
                },
                edit: function( props ) {
                    var attrs = props.attributes || {};
                    var groups = productFeatures.optionGroups || {};

                    return el( Fragment, null,
                        el( 'div', { className: 'cd-product-features-editor' },
                            el( 'div', { className: 'cd-product-features-editor__controls' },
                                stonesField( props ),
                                selectField( props, 'Rozmiar', 'sizePreset', 'sizeCustom', groups.sizes || [] ),
                                selectField( props, 'Sznurek', 'cordPreset', 'cordCustom', groups.cords || [] ),
                                selectField( props, 'Zapięcie', 'claspPreset', 'claspCustom', groups.clasps || [] ),
                                selectField( props, 'Długość', 'lengthPreset', 'lengthCustom', groups.lengths || [] ),
                                selectField( props, 'Przekładki', 'spacersPreset', 'spacersCustom', groups.spacers || [] )
                            ),
                            productFeaturesPreview( attrs )
                        )
                    );
                },
                save: function() {
                    return null;
                }
            } );
            window.cdProductFeaturesRegistered = true;
        } catch ( e ) {}

        return true;
    }

    function registerBlocks() {
        if ( ! wp.blocks.registerBlockType || ! wp.element ) {
            return false;
        }

        ensureCategory();

        items.forEach( function( item ) {
            if ( window.cdSyncedPatternsRegisteredBlocks[ item.blockName ] && wp.blocks.getBlockType && wp.blocks.getBlockType( item.blockName ) ) {
                return;
            }

            if ( wp.blocks.getBlockType && wp.blocks.getBlockType( item.blockName ) && wp.blocks.unregisterBlockType ) {
                try {
                    wp.blocks.unregisterBlockType( item.blockName );
                } catch ( e ) {}
            }

            try {
                wp.blocks.registerBlockType( item.blockName, {
                    apiVersion: 2,
                    title: item.title,
                    category: categorySlug,
                    icon: 'saved',
                    description: 'Zsynchronizowana sekcja opisu produktu CD.',
                    supports: {
                        customClassName: false,
                        html: false,
                        inserter: false,
                        reusable: false
                    },
                    edit: function() {
                        return wp.element.createElement( 'div', {
                            className: 'cd-synced-pattern-block-preview',
                            dangerouslySetInnerHTML: { __html: item.preview }
                        } );
                    },
                    save: function() {
                        return null;
                    }
                } );
                window.cdSyncedPatternsRegisteredBlocks[ item.blockName ] = true;
            } catch ( e ) {}
        } );

        return true;
    }

    function boot() {
        if ( typeof wp === 'undefined' || ! wp.blocks ) {
            return false;
        }

        registerPatterns();
        return registerBlocks() && registerProductFeaturesBlock() && registerProductNotesBlock();
    }

    if ( ! boot() ) {
        var interval = setInterval( function() {
            if ( boot() ) {
                clearInterval( interval );
            }
        }, 200 );

        setTimeout( function() {
            clearInterval( interval );
        }, 10000 );
    }
} )();
JS;
}

function cd_synced_patterns_editor_css(): string {
    return <<<CSS
.cd-synced-pattern-block-preview {
    margin: 0;
}
.editor-styles-wrapper .cd-synced-pattern,
.cd-synced-pattern-block-preview .cd-synced-pattern {
    position: relative;
    margin: 18px 0;
    padding: 18px 20px 18px 22px;
    border: 1px solid #E8DDD5;
    border-left: 4px solid #B8862E;
    border-radius: 8px;
    background: #FFFCFA;
    color: #5E514B;
    box-shadow: 0 10px 24px rgba(47, 40, 36, 0.06);
}
.editor-styles-wrapper .cd-synced-pattern::before,
.cd-synced-pattern-block-preview .cd-synced-pattern::before {
    content: attr(data-cd-label);
    display: inline-flex;
    align-items: center;
    height: 22px;
    margin-bottom: 10px;
    padding: 0 8px;
    border-radius: 999px;
    background: #F5EFE8;
    color: #7A5620;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0;
}
.editor-styles-wrapper .cd-synced-pattern > :first-child,
.cd-synced-pattern-block-preview .cd-synced-pattern > :first-child {
    margin-top: 0;
}
.editor-styles-wrapper .cd-synced-pattern > :last-child,
.cd-synced-pattern-block-preview .cd-synced-pattern > :last-child {
    margin-bottom: 0;
}
.editor-styles-wrapper .cd-synced-pattern h1,
.editor-styles-wrapper .cd-synced-pattern h2,
.editor-styles-wrapper .cd-synced-pattern h3,
.editor-styles-wrapper .cd-synced-pattern h4,
.cd-synced-pattern-block-preview .cd-synced-pattern h1,
.cd-synced-pattern-block-preview .cd-synced-pattern h2,
.cd-synced-pattern-block-preview .cd-synced-pattern h3,
.cd-synced-pattern-block-preview .cd-synced-pattern h4 {
    margin: 0 0 10px;
    color: #2F2824;
    font-size: 18px;
    font-weight: 650;
    line-height: 1.35;
}
.editor-styles-wrapper .cd-synced-pattern p,
.cd-synced-pattern-block-preview .cd-synced-pattern p {
    margin: 0 0 10px;
    color: #5E514B;
    font-size: 15px;
    line-height: 1.75;
}
.editor-styles-wrapper .cd-synced-pattern strong,
.cd-synced-pattern-block-preview .cd-synced-pattern strong {
    color: #2F2824;
    font-weight: 650;
}
.cd-product-features-editor {
    display: grid;
    gap: 18px;
}
.cd-product-features-editor__controls {
    display: grid;
    gap: 14px;
    padding: 16px;
    border: 1px solid #E8DDD5;
    border-radius: 8px;
    background: #FFFCFA;
}
.cd-product-features-editor__field .components-base-control {
    margin-bottom: 8px;
}
.cd-product-features-editor__hint {
    margin: 4px 0 10px;
    color: #6F625B;
    font-size: 13px;
    line-height: 1.5;
}
.cd-product-features-editor__stones {
    max-height: 180px;
    overflow: auto;
    margin: 6px 0 10px;
    padding: 10px 12px;
    border: 1px solid #E8DDD5;
    border-radius: 6px;
    background: #fff;
}
.cd-product-notes-editor {
    display: grid;
    gap: 18px;
}
.cd-product-notes-editor__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    padding: 14px 16px;
    border: 1px solid #C9DFF1;
    border-radius: 8px;
    background: #F4FAFF;
}
.cd-product-notes-editor__controls .components-base-control {
    margin-bottom: 0;
}
.editor-styles-wrapper .cd-product-features,
.cd-product-features-editor .cd-product-features {
    position: relative;
    margin: 18px 0;
    overflow: hidden;
    padding: 20px;
    border: 1px solid #E7D8CE;
    border-radius: 8px;
    background: linear-gradient(135deg, #FFFCFA 0%, #FFF7EF 100%);
    color: #5E514B;
    box-shadow: 0 14px 30px rgba(47, 40, 36, 0.08);
}
.editor-styles-wrapper .cd-product-features__title,
.cd-product-features-editor .cd-product-features__title {
    position: relative;
    margin: 0 0 16px;
    padding-bottom: 12px;
    color: #2F2824;
    font-size: 22px;
    font-weight: 650;
    line-height: 1.25;
}
.editor-styles-wrapper .cd-product-features__title::after,
.cd-product-features-editor .cd-product-features__title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 52px;
    height: 2px;
    border-radius: 999px;
    background: #B8862E;
}
.editor-styles-wrapper .cd-product-features__list,
.cd-product-features-editor .cd-product-features__list {
    display: grid;
    gap: 8px;
    margin: 0;
}
.editor-styles-wrapper .cd-product-features__row,
.cd-product-features-editor .cd-product-features__row {
    display: grid;
    grid-template-columns: minmax(128px, 0.34fr) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    padding: 12px 14px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.72);
}
.editor-styles-wrapper .cd-product-features dt,
.cd-product-features-editor .cd-product-features dt {
    color: #7A5620;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.55;
}
.editor-styles-wrapper .cd-product-features dd,
.cd-product-features-editor .cd-product-features dd {
    margin: 0;
    color: #2F2824;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.65;
    overflow-wrap: anywhere;
}
.editor-styles-wrapper .cd-product-features--empty p,
.cd-product-features-editor .cd-product-features--empty p {
    margin: 0;
    color: #6F625B;
    font-size: 14px;
    line-height: 1.6;
}
.editor-styles-wrapper .cd-product-notes,
.cd-product-notes-editor .cd-product-notes {
    position: relative;
    margin: 18px 0;
    padding: 20px;
    border: 1px solid #C9DFF1;
    border-radius: 8px;
    background: #F4FAFF;
    color: #3D5367;
    box-shadow: 0 14px 30px rgba(23, 59, 93, 0.08);
}
.editor-styles-wrapper .cd-product-notes__title,
.cd-product-notes-editor .cd-product-notes__title {
    position: relative;
    margin: 0 0 16px;
    padding-bottom: 12px;
    color: #173B5D;
    font-size: 22px;
    font-weight: 650;
    line-height: 1.25;
}
.editor-styles-wrapper .cd-product-notes__title::after,
.cd-product-notes-editor .cd-product-notes__title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 52px;
    height: 2px;
    border-radius: 999px;
    background: #3C7DB8;
}
.editor-styles-wrapper .cd-product-notes__list,
.cd-product-notes-editor .cd-product-notes__list {
    margin: 0;
}
.editor-styles-wrapper .cd-product-notes__item + .cd-product-notes__item,
.cd-product-notes-editor .cd-product-notes__item + .cd-product-notes__item {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #D6E7F5;
}
.editor-styles-wrapper .cd-product-notes__item-title,
.cd-product-notes-editor .cd-product-notes__item-title {
    margin: 0 0 8px;
    color: #2F6F9F;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
}
.editor-styles-wrapper .cd-product-notes__content > :first-child,
.cd-product-notes-editor .cd-product-notes__content > :first-child {
    margin-top: 0;
}
.editor-styles-wrapper .cd-product-notes__content > :last-child,
.cd-product-notes-editor .cd-product-notes__content > :last-child {
    margin-bottom: 0;
}
.editor-styles-wrapper .cd-product-notes__content p,
.cd-product-notes-editor .cd-product-notes__content p {
    margin: 0 0 10px;
    color: #3D5367;
    font-size: 15px;
    line-height: 1.75;
}
.editor-styles-wrapper .cd-product-notes__content strong,
.cd-product-notes-editor .cd-product-notes__content strong {
    color: #173B5D;
    font-weight: 650;
}
.editor-styles-wrapper .cd-product-notes--empty p,
.cd-product-notes-editor .cd-product-notes--empty p {
    margin: 0;
    color: #526D82;
    font-size: 14px;
    line-height: 1.6;
}
CSS;
}

add_action( 'enqueue_block_editor_assets', function () {
    wp_register_script(
        'cd-synced-patterns-editor',
        false,
        [ 'wp-blocks', 'wp-element', 'wp-components' ],
        CD_SYNCED_PATTERNS_VERSION,
        true
    );
    wp_enqueue_script( 'cd-synced-patterns-editor' );
    wp_add_inline_script( 'cd-synced-patterns-editor', cd_synced_patterns_editor_js() );

    wp_add_inline_style( 'wp-edit-blocks', cd_synced_patterns_editor_css() );
} );

// Rejestracja przez JS w admin_footer — działa na każdej stronie admina,
// w tym w edytorach izolowanych WooCommerce, które nie wyzwalają enqueue_block_editor_assets.
add_action( 'admin_footer', function () {
    ?>
    <style><?php echo cd_synced_patterns_editor_css(); ?></style>
    <script>
    <?php echo cd_synced_patterns_editor_js(); ?>
    </script>
    <?php
} );

// ---------------------------------------------------------------------------
// Strona admina — lista wzorców z podglądem
// ---------------------------------------------------------------------------

add_action( 'admin_menu', function () {
    add_submenu_page(
        'tools.php',
        'CD Synced Patterns',
        'CD Synced Patterns',
        'manage_options',
        'cd-synced-patterns',
        'cd_synced_patterns_admin_page'
    );
} );

function cd_synced_patterns_admin_page(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'Nie masz uprawnień do tej strony.', 'cd-synced-patterns' ) );
    }

    if ( isset( $_POST['cd_recreate'] ) && check_admin_referer( 'cd_recreate' ) ) {
        cd_synced_patterns_create();
        echo '<div class="notice notice-success"><p>Wzorce zostały utworzone (jeśli brakowało).</p></div>';
    }

    if ( isset( $_POST['cd_sync_from_plugin'] ) && check_admin_referer( 'cd_sync_from_plugin' ) ) {
        $sync_result = cd_synced_patterns_sync_from_plugin();
        echo '<div class="notice notice-success"><p>';
        echo esc_html( sprintf(
            'Wzorce zsynchronizowane z pluginu. Utworzono: %d, zaktualizowano: %d, bez zmian: %d, błędy: %d.',
            $sync_result['created'],
            $sync_result['updated'],
            $sync_result['unchanged'],
            $sync_result['failed']
        ) );
        echo '</p></div>';
    }

    $patterns = get_posts( [
        'post_type'      => 'wp_block',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC',
    ] );

    $managed_slugs = array_column( cd_synced_patterns_definitions(), 'slug' );

    echo '<div class="wrap">';
    echo '<h1>CD Synced Patterns</h1>';
    echo '<p>Zsynchronizowane wzorce bloków dla powtarzalnych sekcji opisów. Edytuj je w <a href="' . admin_url( 'edit.php?post_type=wp_block' ) . '">Wzorce → Moje wzorce</a>.</p>';

    echo '<form method="post">';
    wp_nonce_field( 'cd_recreate' );
    echo '<p><button type="submit" name="cd_recreate" class="button">Utwórz brakujące wzorce</button></p>';
    echo '</form>';

    echo '<form method="post" style="margin-top:12px">';
    wp_nonce_field( 'cd_sync_from_plugin' );
    echo '<p><button type="submit" name="cd_sync_from_plugin" class="button button-primary" onclick="return confirm(\'Nadpisać główne wzorce treścią z aktualnego kodu pluginu?\')">Nadpisz wzorce z pluginu</button></p>';
    echo '<p class="description">Ta akcja aktualizuje istniejące główne wzorce treścią z <code>cd_synced_patterns_definitions()</code>. Produkty używające bloków CD pokażą nową treść.</p>';
    echo '</form>';

    echo '<table class="widefat striped" style="margin-top:20px">';
    echo '<thead><tr><th>Slug</th><th>Tytuł</th><th>Status</th><th>Akcje</th></tr></thead><tbody>';

    foreach ( cd_synced_patterns_definitions() as $def ) {
        $found = array_filter( $patterns, fn( $p ) => $p->post_name === $def['slug'] );
        $post  = reset( $found );

        if ( $post ) {
            $sync_status = get_post_meta( $post->ID, 'wp_pattern_sync_status', true );
            $is_synced   = ( $sync_status !== 'unsynced' );
            $status_html = $is_synced
                ? '<span style="color:#00a32a">✔ zsynchronizowany</span>'
                : '<span style="color:#d63638">✘ niezsynchronizowany</span>';

            $edit_url    = get_edit_post_link( $post->ID );
            $actions     = '<a href="' . esc_url( $edit_url ) . '">Edytuj</a>';
        } else {
            $status_html = '<span style="color:#d63638">✘ nie istnieje</span>';
            $actions     = '—';
        }

        echo '<tr>';
        echo '<td><code>' . esc_html( $def['slug'] ) . '</code></td>';
        echo '<td>' . esc_html( $def['title'] ) . '</td>';
        echo '<td>' . $status_html . '</td>';
        echo '<td>' . $actions . '</td>';
        echo '</tr>';
    }

    echo '</tbody></table>';
    echo '</div>';
}
