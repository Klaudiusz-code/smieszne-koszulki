# Plan zmian

Data: 2026-09-18. Podstawa: [stan projektu](PROJECT_STATUS.md) i
[architektura](ARCHITECTURE.md). Status: implementacja lokalna wykonana; aktualne wyniki w [PROJECT_STATUS.md](PROJECT_STATUS.md)
i [VALIDATION.md](VALIDATION.md). Aktywacja wtyczki, dopasowanie InPost i testy
rzeczywistej płatności nadal wymagają środowiska WordPress. Poniżej zachowano zakres
i kryteria planu; nie oznacza to zakończenia testów integracyjnych ani wdrożenia.

Dalszy uzgodniony etap: wydzielono lokalną bibliotekę commerce dla katalogu,
koszyka i checkoutu. Jej zakres i granice opisuje
[README pakietu](../packages/commerce/README.md); testy zapisano w VALIDATION.

Cel: doprowadzić sklep do kompletnego i sprawdzalnego procesu zakupu, zapewnić
dostęp do całego katalogu oraz uporządkować konfigurację i utrzymanie.
Zakładamy zachowanie obecnego wyglądu sklepu i istniejącego stosu technologicznego.

## 1. Ujednolicić konfigurację backendu — priorytet krytyczny

- Ustalić docelowy WordPress i osobny backend do testów zamówień/płatności.
  Nie wybierać domeny na podstawie samego fallbacku w kodzie.
- Potwierdzić dostępne pola i mutacje GraphQL oraz wersje/konfigurację WooGraphQL,
  JWT, InPost, bramki płatności i własnych wtyczek `cd-*`.
- Wprowadzić wspólne źródło konfiguracji GraphQL, WooCommerce Store API i CF7.
  Dopuścić jawne osobne adresy, jeśli wymaga tego infrastruktura; usunąć przypadkowe
  odwołania do innego sklepu.
- Uzgodnić konfigurację obrazów i CSP z faktycznie używanymi hostami oraz sprawdzić
  adres frontendu w resetowaniu hasła i powrotach z płatności.
- Uzupełnić `.env.example` i instrukcję konfiguracji, w tym `ALLOWED_ORIGINS`.

Główne pliki: `lib/wordpress-config.ts`, `lib/product-image-fallback.ts`,
`app/api/kontakt/route.ts`, `next.config.ts`, `.env.example`, odpowiednie PHP.

Warunek ukończenia: produkty, zdjęcia i kontakt trafiają do świadomie wybranego
backendu; znany jest kontrakt tworzenia zamówienia i zapisu paczkomatu; konfiguracja
testowa nie korzysta przypadkowo z danych produkcyjnych.

## 2. Uporządkować błędy w przepływie zakupu — priorytet krytyczny

- Rozróżnić błędy sieci/HTTP, błędy GraphQL przy HTTP 200 i brak wymaganych danych.
  Ustalić obsługę odpowiedzi częściowych; nie zmieniać globalnie semantyki parsera
  bez sprawdzenia jego wywołań.
- Dodać czytelne stany błędu i ponowienia odczytu koszyka/checkoutu, z zakończeniem
  loading także po błędzie.
- Zapewnić sprzątanie flag zapisu w `finally` i pomijanie spóźnionych odpowiedzi,
  gdy użytkownik zmieni adres albo dostawę w trakcie żądania.
- Nie pozwalać przejść do finalizacji z nieaktualną wyceną, dostawą lub bramką.
- Dodać testy tych zachowań, wybierając minimalne potrzebne narzędzia testowe.

Główne pliki: `lib/graphql-response.ts`, `hooks/useAsyncEffect.ts`,
`views/CartView/CartView.tsx`, `views/CheckoutView/useCheckout.ts` i widok checkoutu.

Warunek ukończenia: awaria backendu daje komunikat i możliwość ponowienia,
a interfejs nie pozostaje bez końca w stanie ładowania ani nie prezentuje sukcesu
po nieudanej mutacji. Ten etap przygotowuje obsługę błędów finalizacji.

## 3. Dokończyć tworzenie zamówienia i płatność — priorytet krytyczny

- Na podstawie potwierdzonego schematu dodać operację tworzenia zamówienia,
  typy odpowiedzi i wpis allowlisty; podłączyć `onPlaceOrder`.
- Przesłać dane klienta, dostawę, płatność, paczkomat i wymagane dane faktury
  zgodnie z kontraktem backendu. Potwierdzić ich zapis w WooCommerce.
- Ponownie zweryfikować koszyk, dostępność produktów, wymagane dane, zgodę
  na regulamin oraz dostępność dostawy/płatności przed finalizacją.
  Wiążące ceny i poprawność zamówienia musi zatwierdzać backend.
- Zablokować równoczesne wysyłanie formularza. Ustalić mechanizm ochrony przed
  duplikacją także przy ponowieniu po timeout; sama blokada przycisku nie wystarczy.
- Obsłużyć zamówienie wymagające płatności, niewymagające płatności oraz błędy
  inicjowania płatności. Używać ID i klucza zwróconych przez backend.
- Sprawdzić ekrany `order-pay`/`order-received`, powrót/anulowanie płatności,
  wznowienie płatności istniejącego zamówienia i synchronizację koszyka/licznika.

Główne pliki: `views/CheckoutView/*`, `components/Checkout/CheckoutNavigation.tsx`,
`queries/checkout/*`, `lib/server/wordpress/documents.ts`, widoki zamówienia i wtyczki PHP.

Warunek ukończenia: testowy zakup od dodania wariantu do koszyka po potwierdzenie
kończy się jednym poprawnym zamówieniem. Paczkomat i dane faktury są zapisane,
a niepowodzenie lub ponowne kliknięcie nie tworzy niekontrolowanych duplikatów.
Pełny scenariusz należy przejść dla gościa oraz konta, jeśli konto jest włączone.

## 4. Uporządkować konto i sesję — priorytet wysoki

- Podłączyć `NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED` do wejść w UI i ustalić
  jednoznaczne zachowanie bezpośrednich tras/API przy wyłączonej funkcji.
- Synchronizować UI z wynikiem potwierdzenia sesji przez backend; traktować
  `wp_user_name` wyłącznie jako dane prezentacyjne.
- Obsłużyć wygasły JWT, nieudane odświeżenie i wylogowanie bez pozostawiania
  nieaktualnych danych konta.
- Sprawdzić zachowanie koszyka podczas przejścia gość → logowanie → wylogowanie
  oraz działanie resetu hasła dla osobnej domeny frontendu.

Główne pliki: `lib/features.ts`, `contexts/auth-state/*`, `components/Navbar.tsx`,
`components/Account/*`, `app/api/wp-*`, `app/api/token-info/route.ts`, proxy GraphQL.

Warunek ukończenia: UI poprawnie odzwierciedla ważność sesji i flagę konta,
zaś dane prywatne pozostają chronione po stronie backendu.

## 5. Udostępnić cały katalog — priorytet wysoki

- Zachować obecny wygląd `ShopView` i kart; wykorzystać istniejącą logikę katalogu
  zamiast automatycznie przywracać stary `ProductListingView`.
- Dodać stronicowanie kursorem i widoczny przycisk „Pokaż więcej” w sklepie
  i kategorii, wraz ze stanem ładowania/błędu i ochroną przed duplikatami kart.
- Przenieść filtrowanie kategorii na backend, aby działało na całym zbiorze.
  Zapytanie po zmianie filtra musi zaczynać od pierwszej strony.
- Podłączyć wyszukiwanie, sortowanie oraz uzgodnione filtry ceny/rozmiaru/koloru;
  zapisywać kryteria w URL i przywracać je przy nawigacji wstecz.
- Rozróżnić liczbę pobranych kart i liczbę wszystkich wyników. Sprawdzić metadata
  i canonical dla adresów z parametrami.

Główne pliki: `views/ShopView/index.tsx`, `views/CategoryView.tsx`,
`views/ShopView/ShopView.tsx`, `lib/catalog-data.ts`, `queries/catalog/*`, kontrolki listingu.

Warunek ukończenia: produkt spoza pierwszych 24 jest dostępny, filtr obejmuje cały
katalog, a powrót do zapisanej strony odtwarza kryteria bez mieszania wyników.

## 6. Przygotować sprawdzone wydanie — priorytet wysoki przed publikacją

- Uruchomić lint, kontrolę typów i build z wybranym backendem; zweryfikować paczkę
  `build:release` oraz serwowanie JS/CSS/obrazów przez `npm run start`.
- Przeprowadzić E2E krytycznej ścieżki zakupu na środowisku testowym i testy awarii
  backendu, wygasłej sesji oraz błędów płatności. Testy zachowań dodawać już we
  wcześniejszych etapach, a tutaj uruchomić zestaw regresyjny.
- Sprawdzić mobilny checkout, obsługę klawiatury, mapę InPost po powrocie między
  krokami, zgody cookies oraz metadata/robots/sitemap.
- Zweryfikować przekazywanie IP przez docelowe proxy i zakres działania limitów
  żądań; przy wielu instancjach dobrać wspólny magazyn limitów, jeśli potrzebny.
- Zaktualizować starsze spisy komponentów i README; usunąć wpisy o nieistniejących
  funkcjach. Nie usuwać kodu tylko dlatego, że stary indeks go opisuje błędnie.
- Uzupełnić `PROJECT_STATUS.md` wynikami oraz instrukcję wdrożenia i wycofania
  wersji, uwzględniając oddzielne wdrożenie wtyczek WordPressa.

Warunek ukończenia: zapisane wyniki sprawdzeń, odtwarzalna paczka produkcyjna
i brak otwartych problemów uniemożliwiających pełny zakup.

## Zależności i decyzje

Kolejność zalecana: **1 → 2 → 3 → 4 → 5 → 6**. Etap 1 jest warunkiem testowania
integracji; etap 2 i 3 tworzą wspólną podstawę działającego checkoutu.

Przed implementacją integracji trzeba ustalić docelową domenę WordPressa,
dostępność środowiska testowego oraz rzeczywiste wtyczki dostaw/płatności.
Pozostałe proponowane wybory to zachowanie wyglądu, „Pokaż więcej” i filtry w URL.
Nie są konieczne do sporządzenia planu dodatkowe zmiany brandingu, migracja stosu
ani przywrócenie listy życzeń.

Każdy etap realizować w małych, spójnych zmianach z własną weryfikacją.
Szacunek czasu ustalić po etapie 1: brak potwierdzonego kontraktu backendu jest
obecnie największą niewiadomą dla checkoutu i płatności.
