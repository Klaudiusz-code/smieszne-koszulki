# Wtyczki WordPress dla frontendu headless

Każdy katalog `cd-*` jest osobną, gotową do spakowania wtyczką WordPress.
Skopiuj katalog do `wp-content/plugins/` albo spakuj go do ZIP i wgraj w panelu.

Zalecana kolejność:

1. WPGraphQL, WooCommerce i WPGraphQL for WooCommerce,
2. WPGraphQL JWT Authentication,
3. `cd-order-pay-graphql`,
4. `cd-order-received-graphql`,
5. `cd-reset-password-url`,
6. pozostałe rozszerzenia zależnie od potrzeb.

Po instalacji wyczyść cache WordPressa i sprawdź endpoint `/graphql`.

Finalizacja nowego checkoutu wymaga także [cd-checkout-graphql](cd-checkout-graphql/README.md).
Przed aktywacją na produkcji przetestuj kontrakt dostawy i płatności na kopii sklepu.
