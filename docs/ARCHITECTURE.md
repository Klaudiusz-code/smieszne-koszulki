# Architektura projektu

Zaktualizowano po migracji GraphQL Codegen 2026-09-19. Punkt wejścia dla agenta:
[AGENTS.md](../AGENTS.md). Luki i rozbieżności: [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Stos i odpowiedzialności

`package.json` deklaruje Next.js `^16.2.11`, React/React DOM `^19.2.6`,
TypeScript `^5`, Tailwind CSS `^4`, ESLint `^9`, `sanitize-html` i `react-icons`.
Dokładne wersje rozwiązuje `package-lock.json`. GraphQL Code Generator generuje
typy wyników/parametrów i `TypedDocumentNode` z lokalnego schematu introspekcji
oraz plików `.graphql`. Nie ma Apollo. [Źródła i generowanie](GRAPHQL.md).

| Katalog/moduł | Rola |
| --- | --- |
| `packages/commerce/` | Core, adaptery HTTP/WooCommerce i hooki React; [opis API](../packages/commerce/README.md) |
| `lib/store/`, `contexts/StoreProvider.tsx` | Podłączenie adaptera HTTP, pamięci przeglądarki i sesji aplikacji |
| `app/` | Cienkie wejścia Next.js: `[...slug]`, `/`, API, sitemap i robots |
| `lib/routing/` | Dopasowanie ścieżek i wybór modułu widoku oraz jego metadata |
| `views/` | Ekrany z danymi i metadata; foldery grupują część serwerową, interaktywną i lokalne hooki |
| `components/` | Komponenty UI i część hooków domenowych obok komponentów |
| `sections/` | Sekcje stron; nie wszystkie są obecnie podłączone |
| `contexts/` | Uwierzytelnienie UI, modal konta, licznik koszyka, toasty |
| `hooks/` | Hooki współdzielone: efekty, blokada przewijania, klawiatura, warstwy |
| `lib/api/`, `lib/server/` | Kontrakty HTTP/DTO, serwisy i adaptery backendu; [API](API.md) |
| `lib/` | Dane katalogu/produktu, transport, bezpieczeństwo, ceny, SEO, zgody |
| `queries/` | Dokumenty `.graphql` aplikacji; operacje commerce są w jej adapterze |
| `graphql/schema.graphql`, `codegen.mts` | Snapshot schematu backendu i konfiguracja generatora |
| `types/` | Typy produktu i konta; pozostałe typy także w modułach domenowych |
| `wp-plugins/cd-*/` | Własne rozszerzenia PHP instalowane osobno w WordPressie |
| `scripts/prepare-release.mjs` | Przygotowanie paczki standalone do `build/` |

## Rama aplikacji i aktualny routing

`app/layout.tsx` ustawia `lang="pl"`, metadata i JSON-LD oraz składa providery:
`AuthStateProvider` → `AccountModalProvider` → `StoreProvider` → `ToastProvider`.
`StoreProvider` tworzy niezależny stan commerce dla drzewa aplikacji. Licznik koszyka
i status produktu korzystają z tej samej instancji co widok koszyka.
`SiteFrame` łączy treść z nagłówkiem i stopką. `SiteHeader` używa `TopBar` i `Navbar`,
a `SiteFooter` renderuje `Footer`. Globalnie montowane są modal konta i panel cookies.
Nie ma obecnie providera listy życzeń.

| Trasa | Faktyczne wejście / zachowanie |
| --- | --- |
| `/` | `app/page.tsx` → `HomeView` pobiera produkty; `HomeView` składa m.in. Hero, CategoryCards, FeaturedProducts |
| `/produkty` | `getShopViewData` → `ShopView` → `ProductCard`; filtry na backendzie, parametry URL i doładowywanie kursorem |
| `/kategoria/[slug]` | Odczyt kategorii i produktów → `ShopView` z filtrami i doładowywaniem |
| `/produkt/[slug]` | `getProductViewData` + `product-page-seo` → `ProductView`; numeryczne ID może przekierować na slug |
| `/kolekcje`, `/prezenty` | Huby kategorii (`CategoryHubView`) |
| `/sklep`, `/kategoria` | `/sklep`: alias `/produkty`; `/kategoria`: przekierowanie do `/kolekcje` |
| `/wlasny-nadruk` | Strona informacyjna z FAQ i odsyłaczem do kontaktu |
| `/kontakt` | `ContactView` i `ContactForm` |
| `/koszyk` | `CartView`, sesyjny koszyk WooCommerce |
| `/zamowienie` | `CheckoutView`, `useCheckout`, `usePlaceOrder`; wymaga `cd-checkout-graphql` |
| `/zamowienie/order-pay/[orderId]` | `OrderPayView`, obsługa płatności istniejącego zamówienia |
| `/zamowienie/order-received/[orderId]` | `OrderReceivedView`, potwierdzenie istniejącego zamówienia |
| `/konto`, `/konto/zamowienia`, `/konto/adresy`, `/konto/pliki` | `AccountView` z właściwą sekcją |
| `/resetuj-haslo` | `ResetPasswordView` |
| `/[...slug]` | Odczyt strony/wpisu WordPressa, sanitizacja HTML |
| `/feed`, `/sitemap.xml`, `/robots.txt` | Generowane zasoby SEO |

Zaawansowany `ProductListingView`, `ProductGrid` i kontrolki filtrów nadal istnieją,
ale obecne strony sklepu i kategorii nie renderują `ProductListingView`.
Zawsze prześledź import z trasy przed zmianą komponentu o podobnej nazwie.

Wszystkie strony poza `/` obsługuje `app/[...slug]/page.tsx`. Moduły w
`views` zawierają dane, metadata i ekrany bez dodatkowej warstwy tras. Hooki produktu
są w `views/ProductView`, a checkoutu w `views/CheckoutView`. API pozostaje
w `app/api`; `/feed` jest przepisywane do `/api/feed`.
[Zasady dopasowania i cache](ROUTING.md).

## Przepływy danych

**SSR:** widok → `lib/server/views` → `ViewProvider` → adapter WordPress.
Serwisy zwracają własne, walidowane DTO. Te same funkcje obsługują `/api/views/*`.
SSR nie wykonuje dodatkowego żądania do własnego API.

**Przeglądarka:** hook commerce → core + adapter HTTP → `/api/store/*` →
`StoreServices` → adapter WooCommerce/WordPress. Konto, opinie, rekomendacje i
płatność istniejącego zamówienia używają `storeApi` z `lib/api/client`.
Dokumenty GraphQL są szczegółem adaptera. Stare publiczne proxy zostało usunięte.
Typy GraphQL pozostają w adapterach, które mapują i walidują własne DTO API.
Transport wyprowadza typ parametrów i odpowiedzi z wybranego dokumentu.

Serwerowy kontekst żądania odczytuje JWT i sesję Woo z HttpOnly cookies,
odświeża JWT i zwraca cookies także przy błędach. Kontrakty walidują wejście
oraz wynik. Brakujące zdjęcia uzupełnia serwerowy `product-image-fallback.ts`.
Pełna lista endpointów, format błędów i sposób wymiany backendu: [API.md](API.md).

## Cache i renderowanie

| Dane | Ustawienie w kodzie |
| --- | --- |
| Katalog, strona główna, produkty podobne, fallback obrazów | `revalidate: 60` |
| Catch-all stron | `revalidate: 0` — HTML na żądanie, zachowany jawny cache fetchy |
| Dane szczegółów produktu | `revalidate: 1` |
| Slugi do `generateStaticParams` | `revalidate: 3600`, pobieranie stronami po 100 |
| WordPress catch-all i feed | `revalidate: 300` |
| Nowe `/api/store/*` i `/api/views/*` | `private, no-store`, `Vary: Cookie` |
| Dotychczasowe API uwierzytelniania | `private, no-cache, max-age=0, must-revalidate` |

Catch-all renderuje HTML na żądanie; nie generuje oddzielnych stron produktów w buildzie. `fetchProducts` pobiera pierwszą partię
24 produktów; `ShopView` używa `useProducts`, który doładowuje kolejne przez adapter i deduplikuje ID.
Publiczny `fetchProducts` używa tego samego mapowania; produkty mają `categorySlugs`.
`lib/catalog-options.ts` zawiera wspólne typy i parametry; nie importuj serwerowego
`catalog-data` do nowych komponentów klienckich. Licznik odróżnia karty od wszystkich wyników.

## Domena i integracje

- **Produkt:** `types/product.ts`, `ProductView`, `useProductVariationSelection`,
  `useProductCartStatus`; produkt prosty/wariantowy, ceny HTML, galeria, opinie.
  `id` GraphQL i liczbowe `databaseId` nie są zamienne.
- **Koszyk:** `CartView` i produkt używają `useCart`. Jedna instancja zasobu
  obsługuje odczyty, mutacje i licznik; modele mają `items`, `product`, `variation`
  bez opakowań GraphQL. Po mutacji następuje odczyt i unieważnienie checkoutu.
  Źródłem cen i sum jest WooCommerce. Zmiana sesji usuwa stare dane z zasobów.
- **Checkout:** hook biblioteczny obsługuje dane i zapisy;
  `views/CheckoutView/useCheckout` odpowiada za kroki, walidację UI, fakturę
  i paczkomat. Koszyk i checkout współdzielą blokadę mutacji, a spóźnione odczyty
  nie nadpisują nowych danych. Kontroler core zapisuje UUID przez wstrzyknięte
  repozytorium prób; aplikacja podłącza do niego sessionStorage.
  Przy nieznanym wyniku UI przechodzi wyłącznie do odczytu `CheckoutAttempt`.
  Nowa mutacja `storeCheckout` w PHP stosuje blokadę w bazie WordPressa.
  `isParcelLockerRate` rozpoznaje fragmenty `methodId`. `ParcelLockerMap` osadza
  EasyPack, którego instancja mapy jest singletonem; przy ponownym montowaniu
  istotne są reset mapy i odświeżenie wymiarów.
- **Konto:** API `wp-login`, `wp-register`, `wp-logout`, `wp-reset-password`,
  `wp-set-password`; `token-info` potwierdza JWT zapytaniem `viewer` w WordPressie.
  `wordpress-auth.ts` wspólnie obsługuje odświeżanie i czyszczenie sesji.
  Flaga `ACCOUNT_FEATURES_ENABLED` steruje wejściami UI, trasami konta i API.
- **Kontakt:** `/api/kontakt` przesyła pola do Contact Form 7. ID formularza
  musi być skonfigurowane; brak poprawnego ID daje HTTP 503.
- **SEO/treści:** `lib/seo.ts`, `product-page-seo.ts`, `JsonLd`, `sanitize-html.ts`.
  Zachowuj canonical, przekierowania i noindex ekranów prywatnych.
- **Zgody:** `lib/cookie-consent.ts`, `CookieConsentManager`, `lib/gtag.ts`.
  Opcjonalne skrypty/zdarzenia zależą od zgód; AdSense także od zmiennej środowiskowej.

## Rozszerzenia WordPress

| Wtyczka | Kontrakt / rola |
| --- | --- |
| `cd-checkout-graphql` | `storeCheckout` i `storeCheckoutStatus`: walidacja, deduplikacja i odzyskiwanie próby |
| `cd-order-pay-graphql` | Mutacja `orderPaymentRedirect`; sprawdza ID + klucz i inicjuje płatność istniejącego zamówienia |
| `cd-order-received-graphql` | Query `orderByKey`; sprawdza ID + klucz przed ujawnieniem danych |
| `cd-reset-password-url` | Zamienia link resetowania w mailu na `home_url('/resetuj-haslo')` |
| `cd-synced-patterns` | Współdzielone sekcje opisów produktów po stronie WP |
| `cd-user-local-pickup` | Odbiór osobisty dostępny dla skonfigurowanego użytkownika |

Wymagane fundamenty backendu: WooCommerce, WPGraphQL, WPGraphQL for WooCommerce.
Konto wymaga JWT Authentication. Instalacja źródeł PHP nie jest częścią buildu
Next.js. Obecności i konfiguracji wtyczek na serwerze nie sprawdzono.
