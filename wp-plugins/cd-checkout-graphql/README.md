# CD Checkout

Wtyczka dodaje `storeCheckout(input: StoreCheckoutInput!)` i odczyt
`storeCheckoutStatus(requestId: String!)`. Wymaga WooCommerce, WPGraphQL,
WooGraphQL oraz kompatybilnej klasy `Checkout_Mutation` z publicznymi metodami
`prepare_checkout_args` i `process_checkout`. Przed wdrożeniem sprawdź ją na kopii
sklepu z dokładnie tą samą wersją WooGraphQL i bramkami.

## Instalacja

1. Wgraj katalog `cd-checkout-graphql` do `wp-content/plugins/` i aktywuj wtyczkę.
2. Aktywuj też `cd-order-pay-graphql` i `cd-order-received-graphql`.
3. Wyczyść cache schematu WordPressa. Frontend sprawdza dostępność schematu przez
   `/api/checkout-status`, z cache odczytu do 60 sekund.
4. Dla InPost ustal klucz metadata używany przez zainstalowaną wtyczkę przewoźnika
   i zdefiniuj `CD_INPOST_POINT_META_KEY` w `wp-config.php`. Nie wpisuj zgadywanej
   wartości. Jeśli integracja potrzebuje danych sesji lub innych hooków, dodaj
   odpowiedni adapter i przetestuj generowanie etykiety przed uruchomieniem.
5. Dla resetu hasła na innej domenie można ustawić `CD_STOREFRONT_URL` używany
   przez osobną wtyczkę `cd-reset-password-url`. Adresy powrotu z płatności należy
   potwierdzić w konfiguracji konkretnej bramki.

Wtyczka zapisuje `_cd_invoice_requested`, opcjonalne `_billing_nip`, dane firmy
w adresie WooCommerce i `_cd_parcel_locker` oraz uzgodniony klucz przewoźnika.
Wymagania wtyczki wystawiającej faktury mogą wymagać dodatkowego mapowania.

## Ochrona przed ponowieniem

- Klucz opcji w bazie to HMAC identyfikatora klienta/sesji i UUID próby.
  `add_option` przejmuje próbę atomowo; blokada działa pomiędzy workerami PHP.
- Przetwarzana próba nie jest wykonywana ponownie. Po sukcesie odczyt zwraca
  to samo zamówienie i jego klucz, bez ponownego wywołania bramki płatniczej.
- Błąd płatności po utworzeniu zamówienia zachowuje jego ID do wznowienia płatności.
- Błąd walidacji przed rozpoczęciem tworzenia pozwala poprawić formularz.
  Nieznany wynik lub przerwanie procesu pozostawia blokadę do wyjaśnienia.
- Odczyt wyniku jest przypisany do pierwotnej sesji/użytkownika. Nowa sesja nie
  dostanie klucza obcego zamówienia, nawet gdy zna UUID próby.

Nie traktuj `clientMutationId` WooGraphQL jako samodzielnej gwarancji idempotencji.
Nie usuwaj opcji `cd_checkout_*` zbiorczo. Są nieautoloadowane i nie zawierają
adresów klientów ani tokenów; zawierają status, ID zamówienia i datę. Przed
czyszczeniem zakończonych wpisów ustal politykę retencji oraz wygasania prób.

## Uzgadnianie nieznanej próby

Sprawdź log WooCommerce `cd-checkout`, opcję wskazaną w logu oraz zamówienie po
`_cd_checkout_request_id`. Jeśli płatność mogła wystąpić, najpierw potwierdź stan
w bramce. Dopiero wtedy operator może przypisać istniejące zamówienie do próby
lub zwolnić blokadę po potwierdzeniu, że żadne zamówienie/płatność nie powstały.
Nie ma automatycznego timeoutu zwalniającego blokadę — mógłby dublować zamówienia.

## Sprawdzenia

`npm run test:php` w głównym katalogu uruchamia izolowane testy kontraktu.
To nie zastępuje testu integracyjnego na WordPressie. W szczególności trzeba
sprawdzić zgodność hooków WooCommerce/WooGraphQL, etykietę InPost, fakturę oraz
przekierowania i ponowienie płatności z używaną bramką.
