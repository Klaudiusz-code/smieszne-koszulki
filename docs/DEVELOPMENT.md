# Przewodnik rozwoju

Powiązane dokumenty: [architektura](ARCHITECTURE.md), [stan projektu](PROJECT_STATUS.md),
[instrukcje agenta](../AGENTS.md).

## Uruchomienie i konfiguracja

Użyj Node z `.nvmrc`, npm i istniejącego `package-lock.json`. Na świeżym checkoutcie:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Nie nadpisuj istniejącego `.env.local`. Wybierz świadomie backend przed uruchomieniem:
docelowy backend potwierdzony przez użytkownika to `https://zabawnekoszulki.pl/graphql`.

| Zmienna | Znaczenie |
| --- | --- |
| `WORDPRESS_GRAPHQL_URL` | Serwerowy endpoint WPGraphQL; jawne ustawienie eliminuje zależność od fallbacku w kodzie |
| `NEXT_PUBLIC_SITE_URL` | Adres frontendu dla metadata/canonical i kontroli origin API |
| `WORDPRESS_CONTACT_FORM_ID` | Numeryczne ID formularza Contact Form 7 |
| `NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED` | Steruje wejściami konta w UI, trasami `/konto` i API uwierzytelniania |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Opcjonalny identyfikator AdSense, używany po zgodzie marketingowej |
| `ALLOWED_ORIGINS` | Dodatkowe adresy origin rozdzielone przecinkami; opisane również w `.env.example` |

Zmienne `NEXT_PUBLIC_*` uwzględnij podczas budowania aplikacji. Nie dodawaj do nich
sekretów. ID tagu Google jest obecnie stałą w `CookieConsentManager`, nie zmienną env.
CF7 i fallback zdjęć korzystają ze wspólnej konfiguracji. Można jawnie nadpisać
`WORDPRESS_BASE_URL` oraz `WORDPRESS_REST_URL`.

## Biblioteka commerce

[Opis pakietu i API](../packages/commerce/README.md). Zaczynaj od modeli/kontraktu
w core, implementacji WooCommerce i testu zachowania. Hooki nie mogą znać tras
Next.js ani tekstów konkretnego sklepu. Podłączaj implementację w `lib/store`
i `StoreProvider`; nie twórz dodatkowego stanu koszyka dla nowego komponentu.
Dokumenty GraphQL biblioteki są w `packages/commerce/woocommerce/queries`,
a jej operacje w `commerceDocuments`. `queries/` zawiera operacje specyficzne
dla aplikacji; dawne fasady `.ts` zostały usunięte.

## Dokumenty i typy GraphQL

Edytuj `.graphql`, następnie uruchom `npm run graphql:generate` i kontrolę TS.
Po zmianie wtyczek/pól backendu najpierw wykonaj `npm run graphql:schema`.
`npm run graphql:check` waliduje operacje i sprawdza aktualność wygenerowanego kodu;
jest uruchamiane także przez build. Generowanie i kontrola używają lokalnego SDL,
bez żądań sieciowych. Sam build Next nadal pobiera dane stron.
Szczegóły, podział plików i przykład: [GRAPHQL.md](GRAPHQL.md).

## Routing stron

Nowy adres dopisz w `lib/routing/storefront.ts`, a moduł widoku i metadata
w `views`. Zarejestruj moduł w `Storefront.tsx`; nie twórz osobnego
folderu strony w `app`. API nadal dodawaj w `app/api`.
Proste widoki trzymaj w jednym pliku. Gdy widok wymaga granicy serwer/klient
lub lokalnych hooków, utwórz `views/NazwaView/`: `index.tsx` jako wejście serwerowe,
komponent kliencki i hooki obok. Nie dodawaj `views/routes` ani fasad w `hooks`
dla hooków używanych wyłącznie w jednym widoku.
Szczegóły i polityka cache: [ROUTING.md](ROUTING.md).

## Jak dobierać miejsce zmiany

| Zadanie | Zacznij od |
| --- | --- |
| Strona główna / branding | `app/page.tsx`, `views/HomeView.tsx`, faktycznie importowane komponenty, `app/globals.css` |
| Nawigacja i stopka | `SiteFrame` → `SiteHeader` → `Navbar`/`TopBar`; `SiteFooter` → `Footer` |
| Lista produktów | `views/ShopView/index.tsx`, `views/ShopView/ShopView.tsx`, `lib/server/views.ts` i `lib/catalog-options.ts` |
| Kategorie | `views/CategoryView.tsx`, `CategoryHubView`, `lib/server/views.ts` i `lib/catalog-options.ts` |
| Produkt / wariant | `views/ProductView/index.tsx`, `lib/server/views.ts`, `ProductView`, hooki produktu |
| Koszyk | `useCart` w bibliotece, adapter WooCommerce, `views/CartView/CartView.tsx` |
| Checkout / InPost | `packages/commerce`, `views/CheckoutView`, `ParcelLockerMap`, `easyPackModal.ts`, CSP |
| Płatność / potwierdzenie | `OrderPayView`, `OrderReceivedView`, odpowiadające zapytania i wtyczki PHP |
| Konto | `AccountView`, komponenty `Account`/`Details`/`Addresses`/`Orders`/`Files`, API `wp-*` |
| Dane z WordPressa / SEO | `app/[...slug]/page.tsx`, `lib/seo.ts`, `lib/sanitize-html.ts`, sitemap/feed |

Nową operację kliencką dodawaj kolejno: kontrakt i walidatory w `lib/api` lub
`packages/commerce/http/contracts.ts` → `StoreServices` → adapter serwera →
`storeApi`/hook → obsługa błędu i odświeżenie zależnego stanu. Dane widoków SSR
wydzielaj do `ViewProvider`/serwisów, współdzielonych z `/api/views/*`.
Dokument GraphQL jest prywatnym szczegółem adaptera; UI nie zna jego nazwy.
Jeśli potrzeba nowego pola WP, uwzględnij PHP i osobne wdrożenie. [API](API.md).

Używaj istniejących helperów `product-price`, `html-text` i `sanitize-html`.
Nowy HTML z CMS musi przejść odpowiednią sanitizację; do JSON-LD używaj `JsonLd`.
Przy asynchronicznej interakcji obsłuż loading, błąd i anulowanie wyniku.
`useAsyncEffect` zapewnia flagę anulowania, ale nie przechwytuje odrzuconych Promise.

## Sprawdzenia odpowiednie do zmiany

```bash
npm run lint
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/tsc -p packages/commerce/tsconfig.json
```

Uruchom `npm test` oraz `npm run test:php` dla logiki checkoutu PHP.
Scenariusze przeglądarkowe i lokalny backend testowy opisano w [VALIDATION.md](VALIDATION.md).
Kontrola typów może korzystać z wygenerowanych plików `.next/types`; wynik na świeżym
checkoutcie nie zastępuje kontroli produkcyjnego buildu.

`npm run build` wymaga dostępności backendu podczas pobierania/generowania stron.
Raportuj oddzielnie błąd kompilacji i błąd sieci/schema WP. Nie maskuj awarii backendu
fikcyjnymi danymi tylko po to, by build przeszedł.

Dobierz scenariusze ręczne do obszaru:

- UI: szerokość mobilna i desktop, klawiatura, stany puste/błędy, długie nazwy,
  brak zdjęcia; sprawdź rzeczywiście renderowaną trasę.
- Katalog: kategorie, produkt spoza pierwszej partii, sortowanie/filtry jeśli są
  częścią zmiany, poprawność adresów i canonical.
- Koszyk: gość, przeładowanie strony, wariant, zmiana ilości/usunięcie i licznik.
- Checkout: aktualizacja adresu, koszt dostawy, zmiana bramki, kupon, wybór i ponowny
  wybór paczkomatu, powrót między krokami; finalizację i płatność w środowisku testowym.
- Konto: dostępność JWT, logowanie/wylogowanie, wygasła sesja, reset hasła; bez
  wysyłania prawdziwych maili w ramach samej analizy dokumentacji.
- Integracje: błędy HTTP i `errors` przy HTTP 200, brak wymaganej wtyczki, brak zgody
  na analitykę, CSP i niedostępny SDK mapy.

Przy zmianach logiki domenowej dodawaj testy istotnych zachowań zgodnie z zakresem;
nie wprowadzaj dużego frameworka wyłącznie dla drobnej zmiany prezentacyjnej.

## Paczka produkcyjna

```bash
npm run build:release
npm run start
```

`next.config.ts` ustawia `output: "standalone"`. `build:release` już wykonuje
`npm run build`, a następnie `prepare-release.mjs` usuwa i odtwarza `build/`, kopiuje
standalone, `public` i statyczne zasoby Next do `build/public/_next/static`.
Sprawdź serwowanie JS/CSS/obrazów przy zmianach pakowania. `start` uruchamia
`node build/server.js`; stary `build/` oznacza uruchomienie starej paczki.

PHP jest wdrażane osobno do WordPressa. Zmiana schematu GraphQL wymaga zgodności
wersji backendu i frontendu. Sposób hostowania produkcji nie został potwierdzony
podczas tej analizy; obecność konfiguracji w repo nie dowodzi aktywnego wdrożenia.
