# Stan projektu

Aktualizacja: **2026-09-19**, po dodaniu GraphQL Codegen w lokalnym katalogu roboczym.
Docelowy backend potwierdzony przez użytkownika: **https://zabawnekoszulki.pl**.
Zmiany frontendu i PHP nie zostały opublikowane ani aktywowane na produkcji.

## Zaimplementowane

- GraphQL Codegen: snapshot 1293 typów z introspekcji docelowego backendu,
  operacje i wspólny fragment koszyka w `.graphql`, generowane typy parametrów,
  odpowiedzi i dokumenty. Migracja obejmuje katalog, produkt, koszyk, checkout,
  konto, uwierzytelnianie, CMS i feed. Usunięto ręczne typy odpowiedzi i fasady
  zapytań `.ts`. Build sprawdza zgodność artefaktów offline; DTO API i runtime
  walidacja pozostają granicą aplikacji. [Workflow](GRAPHQL.md).

- Własne API aplikacji: `/api/store/*` dla przeglądarki i `/api/views/*` dla danych
  ekranów. SSR używa bezpośrednio tych samych serwisów. Runtime walidacja wejść
  i DTO, stabilne kody błędów, per-request cookies i `no-store`.
  Frontend nie importuje WooCommerce ani dokumentów GraphQL. Stare proxy usunięte.
  Produkt i historia zamówień mają płaskie modele bez `nodes`/`__typename`.
  [Kontrakty i wymiana backendu](API.md).


- Centralny catch-all stron i resolver w `lib/routing`. Widoki wraz z metadata,
  danymi i lokalnymi hookami są w `views`, bez osobnej warstwy tras.
  `app` zawiera wyłącznie katalogi `[...slug]` i `api`; `/feed` korzysta z rewrite.
  Zachowano metadata, przekierowanie kategorii i gating konta. HTML catch-all
  powstaje na żądanie; jawny cache danych pozostaje. [Routing](ROUTING.md).

- Lokalna biblioteka `packages/commerce`: niezależny core, adapter WooCommerce
  oraz HTTP i hooki React. Wspólny stan koszyka dla produktu, nagłówka i koszyka;
  adapter WooCommerce działa na serwerze, a przeglądarka używa adaptera HTTP. Checkout zachowuje
  deduplikację i odzyskiwanie próby, a formularz/routing pozostają w aplikacji.
  [Zakres, API i ograniczenia v0.1](../packages/commerce/README.md).

- Wspólna konfiguracja GraphQL, Store API, CF7, hostów obrazów i CSP. Opcjonalne
  nadpisania `WORDPRESS_BASE_URL` i `WORDPRESS_REST_URL`; brak odwołań do cudaduszy.pl
  w aktywnej konfiguracji integracji.
- Jawne błędy i ponawianie odczytu koszyka/checkoutu, ścisła obsługa błędów GraphQL,
  blokada równoczesnych zapisów, pełny odczyt wyceny po zmianach i blokada przejścia
  z niezapisanymi danymi. Ogólny parser nadal obsługuje odpowiedzi częściowe.
- Obsługa finalizacji w UI, faktury, paczkomatu, przekierowania i odzyskiwania próby
  po przerwaniu połączenia. Nowa wtyczka `cd-checkout-graphql` dodaje `storeCheckout`
  oraz `storeCheckoutStatus`, waliduje zaakceptowanie regulaminu i wycenę, blokuje
  powtórzenie tej samej próby w bazie WP i zachowuje utworzone zamówienie przy błędzie
  płatności. Nie zakładać, że sama obecność jej kodu oznacza działający checkout live.
- Flaga konta steruje UI, trasami konta i API uwierzytelniania. Stan sesji jest
  potwierdzany przez `viewer` w WordPressie, z odświeżaniem JWT i obsługą wygaśnięcia.
- Katalog i kategorie: przycisk „Pokaż więcej”, deduplikacja stron, wyszukiwanie,
  sortowanie i filtry w URL. Filtrowanie kategorii obejmuje cały backend.
  Logika parametrów oddzielona od fetchy w `lib/catalog-options.ts`.
- Testy Node/PHP i lokalny backend demonstracyjny do scenariuszy awarii.

## Warunki uruchomienia finalizacji

1. Zainstalować `wp-plugins/cd-checkout-graphql` w WordPressie, z WooGraphQL zgodnym
   z metodami używanymi przez wtyczkę. Brak schematu wtyczki blokuje składanie
   zamówienia w UI i wyświetla komunikat o niedostępności.
2. Potwierdzić aktywne `cd-order-pay-graphql` i `cd-order-received-graphql`.
3. Ustalić dokładną wtyczkę InPost i jej kontrakt. Nowa wtyczka wymaga jawnego
   `CD_INPOST_POINT_META_KEY`; bez niego odrzuca zamówienie do paczkomatu.
   Sam klucz metadata może nie wystarczyć, jeśli przewoźnik wymaga dodatkowych
   pól sesji, hooków albo walidacji. Należy zweryfikować tworzenie etykiety.
4. Przejść pełny zakup i powrót z bramki na środowisku testowym, w tym scenariusze
   anulowania i ponowienia płatności, gościa i konta oraz dane faktury.

Nie wskazano osobnego środowiska testowego ani dostępu administracyjnego do WP.
Nie tworzono prawdziwych zamówień, nie uruchamiano płatności, nie wysyłano formularzy
kontaktowych/maili i nie instalowano wtyczek na serwerze.

## Weryfikacja

Bieżące wyniki i instrukcja odtworzenia: [VALIDATION.md](VALIDATION.md).
Pierwszy build produkcyjny po zmianach przeszedł z publicznymi danymi sklepu.
Odczytano schemat `CheckoutInput`/`CheckoutPayload` na docelowym backendzie.
Testy PHP są izolowanymi testami kontraktu, nie pełnym testem WooCommerce.

## Pozostałe ograniczenia

- Limity żądań są w pamięci pojedynczego procesu. Przed wdrożeniem na wiele instancji
  należy dobrać współdzielony magazyn i potwierdzić zaufane nagłówki IP od proxy.
- `useAsyncEffect` nie przechwytuje globalnie wszystkich błędów. Krytyczne ścieżki
  koszyka i checkoutu mają własną obsługę; pozostałe hooki wymagają osobnego przeglądu.
- Sesję konta trzeba sprawdzić z rzeczywistym JWT, w tym zachowanie koszyka przy
  logowaniu. W domyślnej konfiguracji funkcje konta są wyłączone.
- Zakończone próby checkoutu są przechowywane jako nieautoloadowane opcje WP.
  Próby o nieznanym wyniku celowo wymagają sprawdzenia przez operatora; nie usuwać
  ich blokad bez ustalenia, czy powstało zamówienie. Szczegóły w instrukcji wtyczki.
- Istnieją starsze, niepodłączone komponenty listingu; nie przywrócono listy życzeń.
- Treści marketingowe, dane kontaktowe i wygląd nie były przedmiotem przebudowy.
