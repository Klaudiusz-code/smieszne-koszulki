# API aplikacji i serwisy widoków

Stan: 2026-09-19. Frontend nie zna dokumentów ani nazw operacji GraphQL.
WordPress/WooCommerce jest implementacją po stronie serwera.

## Przepływ

```text
SSR: views/* → lib/server/views → ViewProvider → adapter WordPress
HTTP: /api/views/* → te same serwisy → te same DTO

Przeglądarka: hooki commerce → core → adapter HTTP → /api/store/*
             komponenty konta/opinii/zamówień → storeApi → /api/store/*
Serwer: walidacja → StoreServices → adapter WooCommerce/WordPress → backend
```

SSR nie wykonuje fetch do własnego `/api`. Widoki zajmują się renderingiem,
metadata, 404 i przekierowaniami. Pobieranie i mapowanie danych jest w serwisach.
`server-only` pilnuje granicy importów. Nie ma dodatkowego `views/routes`.

## Kontrakty

- `packages/commerce/core/models.ts`: domena wspólnej biblioteki.
- `packages/commerce/http/contracts.ts`: wejścia i odpowiedzi operacji commerce.
- `lib/api/contracts.ts`: konto, opinie, rekomendacje, płatność i potwierdzenie.
- `lib/api/views.ts`: `HomeViewData`, `ProductViewData`, `ShopViewData`, treści CMS.
- `types/product.ts`: płaskie modele produktu, wariantów, kategorii i opinii.

Schematy wykonują walidację w runtime po obu stronach HTTP; serwisy publicznych
widoków walidują również dane przekazywane do SSR. Projekcja obiektów usuwa pola
spoza kontraktu. Nieprzewidziany `null`, niekompletne zamówienie lub zły adres
przekierowania daje błąd zamiast pozornie poprawnych danych. Nullable kolekcje WP
normalizuje adapter (np. brak kuponów → `[]`). Formularze nadal mają własną walidację,
a backend pozostaje autorytetem dla ceny, uprawnień i przyjęcia zamówienia.

Odpowiedź sukcesu: `{ data: DTO }`. Potwierdzenie zapisu: `{ data: { ok: true } }`.
Błąd: `{ error: { code, message } }`. Kody: `validation`, `unauthorized`, `forbidden`,
`unavailable`, `rate_limit`, `upstream`, `not_found`. UI nie interpretuje GraphQL.
Zmiany dostawcy danych nie zmieniają tych kontraktów; zmiany funkcjonalne kontraktu
wymagają świadomej migracji konsumentów i testów.

## Endpointy

| Metoda / ścieżka | Dane |
| --- | --- |
| GET `/api/views/home` | Produkty strony głównej |
| GET `/api/views/product?slug=...` | Produkt, podobne produkty, informacja o dopasowaniu ID |
| GET `/api/views/shop` | Pierwsza strona katalogu, filtry, atrybuty, wybrana kategoria |
| GET `/api/views/category?slug=...` | Te same dane listingu dla kategorii |
| GET `/api/views/content?path=o-nas` | Strona lub wpis CMS |
| POST `/api/store/products/search` | `{filters, after?}` → strona produktów |
| POST `/api/store/cart` | `{}` → koszyk |
| POST `/api/store/cart/add`, `/remove`, `/quantity` | Dodanie, usunięcie, zmiana liczby |
| POST `/api/store/cart/recommendations` | `{categoryId}` → karty produktów |
| POST `/api/store/checkout` | `{}` → autorytatywna wycena i metody |
| POST `/api/store/checkout/address`, `/shipping` | Zapis adresu lub dostawy |
| POST `/api/store/checkout/coupons/apply`, `/remove` | `{code}` → potwierdzenie |
| POST `/api/store/orders/place`, `/status` | Finalizacja `{input, requestId}` / odczyt `{requestId}` |
| POST `/api/store/orders/receipt`, `/payment` | `{orderId, orderKey}` → zamówienie / inicjacja płatności |
| POST `/api/store/products/review` | `{productId, content, rating, author?, authorEmail?}` |
| POST `/api/store/account`, `/update` | Odczyt i zapis danych konta |
| POST `/api/store/account/addresses`, `/address`, `/orders`, `/files` | Adresy, zapis adresu, historia, pliki |

Endpointy widoków listingu przyjmują te same parametry filtrów co adres strony.
Odczyty sesyjne używają POST: dane prywatne i klucze zamówień nie trafiają do URL.
`app/api/store/[...path]` rozpoznaje wyłącznie jawny rejestr operacji, nie dowolny
kod/tekst zapytania. Publiczny `/api/graphql` i klient `lib/gql.ts` zostały usunięte.
Dotychczasowe API logowania/resetu (`wp-*`), `token-info`, `kontakt`, `checkout-status`
i `feed` zachowują własne kontrakty; już wcześniej stanowiły granicę serwerową.

## Sesja i bezpieczeństwo

Każde żądanie tworzy osobny kontekst. JWT/refresh token oraz `wc_session` pozostają
w HttpOnly cookies; klient HTTP nie otrzymuje tokenów w JSON. Odświeżone cookies
są dodawane także do odpowiedzi błędnych. JWT ma pierwszeństwo przed sesją gościa.
Brak logowania i wyłączona flaga konta blokują operacje konta przed odczytem danych.

API store wymaga dozwolonego origin i JSON, limituje body do 16 KiB oraz ruch do
120 żądań/minutę/IP (magazyn w pamięci procesu). Odpowiedzi mają `private, no-store`
i `Vary: Cookie`. Sesyjne żądania backendowe nie są cache'owane. Publiczne serwisy
SSR zachowują dotychczasowy jawny cache fetchy. Publiczne endpointy widoków mają
zachowawcze `no-store`, ale mogą korzystać z tego cache danych backendu.

Po błędzie kuponu core odczytuje checkout i pozwala poprawić kod, jeśli odczyt
potwierdzi stan. Nie ponawia zapisu. Nieznany wynik zamówienia zachowuje ID próby;
jedyna dalsza operacja to odczyt statusu. Utrata odpowiedzi nie oznacza odrzucenia.

## Wymiana backendu i rozwój

Implementuj `ViewProvider` i `StoreServices`, następnie zmień podłączenie w
`lib/server/views.ts` i `lib/server/store.ts`. Provider musi również zapewnić sesję,
autoryzację, deduplikację, weryfikację klucza zamówienia i inicjację płatności.
API logowania, CF7, feed/sitemap, media i konfigurację hostów dostosuj osobno.
Samo podmienienie adresu GraphQL nie zastępuje adaptera innego systemu.

Adapter WordPress korzysta z generowanych `TypedDocumentNode` i typów
wybranych pól. Ich źródłem są pliki `.graphql` oraz snapshot schematu backendu.
Codegen nie zastępuje walidacji JSON ani modeli API. [Praca z GraphQL](GRAPHQL.md).

Nowa funkcja: model/schemat → metoda serwisu → adapter dostawcy → klient/hook →
test zachowania. Nie importuj `lib/server/wordpress`, `queries` ani adaptera
WooCommerce do widoków i hooków przeglądarki. Dodając nowy provider uruchom te same
testy kontraktów; aktualny zestaw zawiera także atrapę niezależną od WordPressa.
