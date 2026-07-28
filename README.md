# Zabawne Koszulki — Next.js + WooCommerce

Headless sklep oparty o Next.js 16, WordPress, WPGraphQL i WooCommerce. Frontend korzysta
z danych pod adresem `https://zabawnekoszulki.pl/graphql`.

## Co działa

- strona główna z produktami pobieranymi z WordPressa,
- katalog, kategorie, wyszukiwanie, ceny, sortowanie i filtry Kolor/Rozmiar,
- strony produktów prostych i wariantowych,
- galeria, stany magazynowe, opinie i podobne produkty,
- sesyjny koszyk WooCommerce dla gościa,
- kupony, wysyłka i interfejs checkoutu; finalizacja wymaga wtyczki `cd-checkout-graphql`,
- konto klienta po aktywacji opcjonalnej wtyczki uwierzytelniania,
- SEO: metadata, Open Graph, JSON-LD, sitemap, robots i feed,
- obsługa stron WordPress przez trasę catch-all,
- zgody cookies, zabezpieczony proxy GraphQL i limity żądań.

## Uruchomienie

Wymagany jest Node zgodny z plikiem `.nvmrc`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Produkcja:

```bash
npm run build:release
npm run start
```

## Konfiguracja WordPressa

Wymagane wtyczki po stronie WordPress:

1. WooCommerce
2. WPGraphQL
3. WPGraphQL for WooCommerce (WooGraphQL)

Publiczny odczyt katalogu został sprawdzony na docelowym endpointcie.
Finalizacja zamówień wymaga instalacji i testu opisanej niżej wtyczki.

Funkcje opcjonalne:

- WPGraphQL JWT Authentication — logowanie i konto klienta,
- `wp-plugins/cd-order-pay-graphql` — przekierowanie do płatności po utworzeniu zamówienia,
- `wp-plugins/cd-order-received-graphql` — bezpieczny ekran potwierdzenia zamówienia,
- `wp-plugins/cd-reset-password-url` — reset hasła kierowany do frontendu,
- `wp-plugins/cd-synced-patterns` — współdzielone sekcje opisów produktów,
- `wp-plugins/cd-user-local-pickup` — odbiór osobisty przypisany do klienta.

Finalizacja zamówień:

- `wp-plugins/cd-checkout-graphql` — walidacja i ochrona przed powtórzeniami;
  [instalacja i wymagania](wp-plugins/cd-checkout-graphql/README.md).
- InPost i Przelewy24 należy zainstalować i skonfigurować osobno w WordPressie;
  ich źródeł nie ma w tym repo. Kontrakt paczkomatu trzeba dopasować do używanej wtyczki.

Po aktywacji JWT ustaw:

```dotenv
NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED=true
```

Formularz kontaktowy korzysta z Contact Form 7. Jego ID podaj jako
`WORDPRESS_CONTACT_FORM_ID`.

## Zmienne środowiskowe

Pełna lista znajduje się w `.env.example`. Najważniejsze:

- `WORDPRESS_GRAPHQL_URL` — backend GraphQL,
- `NEXT_PUBLIC_SITE_URL` — publiczny adres aplikacji Next,
- `WORDPRESS_CONTACT_FORM_ID` — opcjonalne ID formularza CF7,
- `NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED` — funkcje konta zależne od JWT,

## Weryfikacja

```bash
npm run lint
npm test
npm run test:php
npm run build
```

Build pobiera aktualne produkty z WordPressa i generuje statyczne strony produktów.

## Kontekst rozwoju

- [Architektura](docs/ARCHITECTURE.md)
- [Przewodnik rozwoju](docs/DEVELOPMENT.md)
- [Stan i ograniczenia](docs/PROJECT_STATUS.md)
- [Plan zmian](docs/CHANGE_PLAN.md)
- [Weryfikacja i wdrożenie](docs/VALIDATION.md)

`WORDPRESS_BASE_URL` i `WORDPRESS_REST_URL` opcjonalnie nadpisują adresy wyprowadzone
z `WORDPRESS_GRAPHQL_URL`. `ALLOWED_ORIGINS` rozszerza listę dopuszczonych originów.

## Biblioteka sklepu

Logika katalogu, koszyka i checkoutu oraz hooki React znajdują się w lokalnym
[pakiecie commerce](packages/commerce/README.md). Aplikacja pozostaje jego pierwszym
konsumentem; pakiet nie jest jeszcze publikowany w npm.
