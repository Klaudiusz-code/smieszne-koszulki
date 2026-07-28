# Weryfikacja i wdrożenie

Data: 2026-09-19. Docelowy backend: `https://zabawnekoszulki.pl/graphql`.

## GraphQL Codegen

- Pobrano publiczną introspekcję docelowego backendu: 1293 typy w lokalnym SDL.
- `npm run graphql:generate` i `graphql:check`: oba zestawy dokumentów są zgodne
  ze schematem i zapisanymi artefaktami. Kontrolowane dopisanie do wygenerowanego
  pliku zostało odrzucone; tryb check nie nadpisał pliku. Przywrócono oryginał.
- `npm test`: 50/50. Nowe przypadki weryfikują dokumenty wraz z fragmentami,
  przekazywanie refresh tokena wyłącznie w variables i walidację enumów backendu.
  Testy kompilacji w `tests/types/graphql-contracts.ts` wymagają odrzucenia
  brakujących/błędnych parametrów, nieznanej operacji i pola spoza selekcji.
- Lint bez ostrzeżeń, TypeScript aplikacji i biblioteki, `npm run build:release`.
- 22/22 sprawdzenia `check-storefront-routes.mjs` na lokalnym buildzie z publicznymi
  danymi WordPressa; także katalog, produkt, CMS oraz feed po migracji dokumentów.
- `check-store-api.mjs` przeszedł z lokalnym fixture: błędy i poprawne kupony,
  aktualizacja koszyka, walidacja wejść, origin, limity, paginacja, gating konta,
  utracona odpowiedź zamówienia, odczyt statusu i izolacja/rotacja cookies.

Nie wykonano mutacji na produkcyjnym WordPressie ani realnej płatności.
To nie jest test integracji live konta, Przelewy24 ani InPost. Dokumentacja i kod
nie zostały wdrożone na produkcję. Starsze wyniki poniżej dotyczą wcześniejszych etapów.

## Warstwa API aplikacji (poprzedni etap)

- `npm test`: 47 testów, w tym 11 nowych dotyczących granicy HTTP i DTO:
  nieprawidłowe dane, brakujące pola, utrata odpowiedzi zamówienia, definitywne
  odrzucenie przed zapisem, kupony, zakres ceny wariantów, mapowanie modeli,
  alternatywny provider widoków i kontrola importów UI.
- Lint, TypeScript aplikacji i biblioteki oraz `npm run build:release`.
- `node scripts/check-storefront-routes.mjs`: 22 odczytowych sprawdzeń lokalnej
  paczki z publicznymi danymi backendu, w tym wszystkie pięć endpointów danych widoków.
- `node scripts/check-store-api.mjs`: lokalny fixture, błędny/poprawny kupon,
  odświeżanie wyceny i ilości, odrzucanie złych danych przed wysłaniem do backendu,
  origin/content-type, limit body, paginacja, wyłączone konto, odzyskanie statusu
  po jednej nieudanej odpowiedzi zamówienia, prywatny cache oraz przekazywanie
  cookies także po błędach. Tokeny testowe są fikcyjne.
- Checkout z fixture wyrenderował się w przeglądarce z licznikiem koszyka,
  danymi dostawy, kuponem i przyciskiem „Dalej”.

Nie wykonywano nowych mutacji na docelowym WordPressie. Realna płatność P24,
InPost i aktywna sesja konta nadal wymagają testów integracyjnych na odpowiednim
środowisku. Starsze wyniki poniżej opisują poprzednie etapy, nie nowe testy live.

Aby odtworzyć test API, uruchom backend `node tests/fixtures/store.mjs` na 4301
oraz paczkę `build/server.js` z `PORT=3101`, `HOSTNAME=127.0.0.1`,
`ALLOWED_ORIGINS=http://127.0.0.1:3101` i
`WORDPRESS_GRAPHQL_URL=http://127.0.0.1:4301/graphql`. Następnie uruchom skrypt.
Skrypt wymaga znacznika sesji fixture przed wykonaniem jakichkolwiek zapisów.

## Uporządkowanie widoków i lokalnych hooków

Usunięto osobną warstwę tras z `views`. Dispatcher jest w `lib/routing/Storefront.tsx`,
a widoki zawierają własne metadata i pobieranie danych. Foldery produktu i checkoutu
grupują ich komponenty oraz lokalne hooki; konto ma wspólne wejście dla wszystkich sekcji.
Przeszły lint, TypeScript, 36 testów Node i `npm run build:release`.
Na lokalnej paczce przeszło 16 odczytowych sprawdzeń skryptu routingu (HTTP,
metadata, canonical i przekierowania). Potwierdzono renderowanie katalogu
w przeglądarce. Nie wykonywano mutacji koszyka, zamówień ani płatności.

## Wykonane sprawdzenia

- `npm run lint` i kontrola TypeScript: poprawne.
- `npm test`: 36 testów — 10 aplikacji, 21 biblioteki commerce oraz 5 routingu.
  Biblioteka:
  współdzielenie odczytów, wyścigi zapisów, izolacja instancji i sesji,
  unieważnianie i odzyskiwanie wspólnego koszyka/checkoutu, odzyskiwanie próby, błędy storage,
  paginacja, kontrakt adaptera i granice zależności.
- Osobne `tsc -p packages/commerce/tsconfig.json`: biblioteka przechodzi kontrolę
  typów bez aliasów i konfiguracji Next.js aplikacji.
- `npm run test:php`: 13 asercji kontraktu — powtórzenia, równoczesna próba,
  błąd płatności, walidacja, nieznany wynik, kontrola wyceny/regulaminu i separacja sesji.
- `npm run build:release`: poprawna kompilacja i generowanie 16 stron/zadań
  statycznych (strony catch-all renderowane na żądanie) z publicznymi odczytami WordPressa; paczka w `build/`.
- Przeglądarka na paczce produkcyjnej: katalog realnego backendu, filtr Kubki,
  wyszukiwanie Mercedes, cofnięcie z odtworzeniem filtra i szerokość 390 px.
- Lokalny backend z fikcyjnymi danymi: doładowanie 24 → 26 produktów, blokada
  „Dalej” dla niezapisanej faktury i odblokowanie po zapisie, przejście kroków,
  awaria wysłania zamówienia, przeładowanie i odzyskanie potwierdzenia bez
  powtórzenia mutacji (`placeCalls: 1`), odblokowanie kolejnej próby dopiero po
  odczytaniu potwierdzenia, błąd odczytu checkoutu i skuteczne ponowienie.
- Mobilny checkout po poprawce nagłówka: szerokość dokumentu równa szerokości
  obszaru strony (375 px), bez przewijania poziomego.

Po wydzieleniu commerce powtórzono w przeglądarce: zmianę ilości 1 → 2 ze
zgodnym licznikiem i wyceną w checkoutcie, paginację 24 → 26 oraz przerwane
wysłanie i odzyskanie potwierdzenia po przeładowaniu (`placeCalls: 1`).
Na końcowej paczce sprawdzono ponowienie checkoutu po awarii: dane zamówienia
i licznik koszyka wracają razem (2 sztuki), bez dodatkowej akcji w koszyku.

Testy PHP używają atrap WordPressa/WooCommerce, a przeglądarkowy test finalizacji
lokalnego backendu. Żaden z nich nie dowodzi działania konkretnej bramki, InPost,
JWT lub wszystkich hooków na docelowej instalacji. Nie utworzono zamówień live.

### Poprawka pustej listy kuponów

Adapter WooCommerce normalizuje `appliedCoupons: null` do `[]`, aby checkout
mógł bezpiecznie używać `length` i `map`. Test regresyjny odtwarzał błąd przed
poprawką; sprawdza stan checkoutu dla `null`, pustej listy i zastosowanego kuponu.
Fixture także zwraca `null` przy braku kuponów. Po poprawce przeszły 31 testów,
lint i obie kontrole TypeScript. Dla tej poprawki nie powtarzano buildu ani
testów przeglądarkowych opisanych wyżej.

## Odtworzenie lokalnego testu przeglądarkowego

### Odrzucony kupon

Po błędzie kuponu checkout odczytuje aktualne sumy bez ponawiania mutacji.
Potwierdzony odczyt usuwa blokadę formularza, a przy kuponie widnieje komunikat
backendu jako zwykły tekst z odkodowanymi encjami. Transport `strict` nie loguje
tego samego błędu w konsoli klienta. Testy obejmują poprawienie kodu po odrzuceniu,
awarię odczytu po błędzie, utratę odpowiedzi zapisu, współdzieloną blokadę i zmianę
sesji podczas odczytu. Przeszły 36 testów, lint i obie kontrole TypeScript;
nie wykonywano mutacji kuponów na produkcji ani testu przeglądarkowego tej poprawki.
Fixture akceptuje `TEST` bez rozróżniania wielkości liter, a inne kody odrzuca.

### Hydratacja wskaźnika kroków checkoutu

Przy zgłoszeniu rozbieżnego `disabled` surowy HTML `/zamowienie` zawierał
poprawnie wyłączone przyciski. Możliwą przyczyną jest odtwarzanie stanu przycisków
przez przeglądarkę przy przeładowaniu ([zgłoszenie Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1847798));
nie odtworzono tego w sesji użytkownika. Wskaźnik renderuje teraz bieżące i przyszłe
kroki jako etykiety, a ukończone jako przyciski powrotu. Sprawdzono HTML lokalnej
trasy, lint, TypeScript i 31 testów Node. Nie powtarzano pełnego checkoutu w przeglądarce.

### Backend testowy

Najpierw przygotuj aktualne `build/` przez `npm run build:release`.
W dwóch terminalach uruchom:

```bash
node tests/fixtures/store.mjs
```

```bash
env PORT=3101 HOSTNAME=127.0.0.1 \
  ALLOWED_ORIGINS=http://127.0.0.1:3101 \
  WORDPRESS_GRAPHQL_URL=http://127.0.0.1:4301/graphql \
  node build/server.js
```

Otwórz `http://127.0.0.1:3101/produkty` albo `/zamowienie`.
Backend fixture ma 26 produktów i gotowy fikcyjny adres/koszyk. Mutacja zamówienia
celowo odpowiada błędem 502, a odczyt próby zwraca fikcyjne potwierdzenie.
`GET http://127.0.0.1:4301/stats` pokazuje licznik prób. POST `/failure` z JSON
`{"enabled":true}` symuluje awarię odczytu, a `false` ją wyłącza.
To serwer lokalny testów, nigdy element wdrożenia produkcyjnego.

## Uruchomienie produkcyjne

1. Zainstaluj i sprawdź wtyczki na kopii WordPressa zgodnie z
   [instrukcją checkoutu](../wp-plugins/cd-checkout-graphql/README.md).
2. Zweryfikuj rzeczywiste zamówienie testowe: ceny, dostawę, etykietę InPost,
   dane faktury, przekierowanie do bramki, powrót, anulowanie i ponowienie.
3. Ustaw produkcyjne zmienne z `.env.example`. `NEXT_PUBLIC_SITE_URL` musi wskazywać
   frontend, a `NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED=true` wymaga działającego JWT.
4. Uruchom lint, testy, kontrolę typów i `npm run build:release`.
5. Wdróż paczkę `build/` oraz konfigurację serwera, uruchamiając `node build/server.js`.
   Nie uruchamiaj backendu fixture. Ustaw origin frontendowy i poprawne HTTPS/proxy.
6. Sprawdź statyczne zasoby, metadata, katalog, puste/błędne stany i checkout.
   Potwierdź hosty powrotów z bramki. Schema własnej wtyczki jest wymagana przed
   udostępnieniem przycisku składania zamówień.

## Wycofanie

Zachowaj poprzednią paczkę frontendu i kopię zmienianych wtyczek/konfiguracji.
Wycofuj frontend do poprzedniej zgodnej wersji bez kasowania zamówień i opcji
`cd_checkout_*`. Rekordy deduplikacji muszą przetrwać restart i rollback.
Przed wyłączeniem wtyczki upewnij się, że nie ma nieuzgodnionych prób/płatności.
Nowy frontend bez wtyczki blokuje finalizację, więc nie jest to przeźroczyste
wycofanie działającego checkoutu. Szczegóły restartu i proxy zależą od hostingu,
którego konfiguracji nie potwierdzono w tej sesji.

## Weryfikacja centralnego routingu

Po zmianie `app` zawiera tylko `[...slug]` i `api` oraz pliki główne Next.js.
Przeszły lint, TypeScript, 30 testów Node i build produkcyjny. Na paczce sprawdzono
HTTP katalogu, aliasu sklepu, filtrowania, produktu, kategorii, koszyka, checkoutu,
tras płatności/potwierdzenia (wyłącznie renderowanie), konta przy wyłączonej fladze,
404 i przekierowania kategorii oraz RSS/API. W przeglądarce potwierdzono
przejście katalog → produkt → własny nadruk oraz zmianę tytułów stron. Canonical i noindex są zachowane;
klucz zamówienia nie trafia do canonical. Weryfikację można odtworzyć przez
`node scripts/check-storefront-routes.mjs` przy lokalnym serwerze na porcie 3100.
Skrypt używa istniejących publicznych produktów/kategorii docelowego backendu;
po zmianie katalogu zaktualizuj odpowiednie adresy.

`/regulamin` na obecnym backendzie zwrócił 404; resolver przekazuje go do CMS,
ale backend nie zwrócił strony. To nie jest potwierdzenie dostępności treści prawnych.
Catch-all renderuje strony na żądanie, zachowując jawny cache danych; szczegóły
w [ROUTING.md](ROUTING.md). Nie wykonano zakupów ani zmian produkcyjnych.
