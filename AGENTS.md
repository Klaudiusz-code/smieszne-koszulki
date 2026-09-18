# Kontekst pracy nad projektem

Projekt to polski sklep „Zabawne Koszulki”: Next.js App Router + React + TypeScript,
z WordPressem/WooCommerce jako backendem. Nie ma lokalnej bazy ani ORM.

## Od czego zacząć

1. Sprawdź `git status --short` i istniejący diff; zachowaj zmiany użytkownika,
   również częściowo staged. Nie resetuj ich ani nie dołączaj automatycznie do commita.
2. Przeczytaj [architekturę](docs/ARCHITECTURE.md) i
   [stan projektu](docs/PROJECT_STATUS.md). Drugi dokument jest datowanym obrazem
   kodu, a nie gwarancją aktualności ani działania produkcji.
3. Przy implementacji korzystaj z [przewodnika rozwoju](docs/DEVELOPMENT.md).
   Proponowana kolejność prac i kryteria ukończenia są w
   [planie zmian](docs/CHANGE_PLAN.md); realizuj zakres uzgodniony w bieżącym zadaniu.
4. Weryfikuj opisy w kodzie. Starsze `README.md`, `COMPONENTS.md`, `VIEWS.md`,
   `PROVIDERS.md`, `MODALS.md`, `SECTIONS.md` i `ICONS.md` są pomocniczymi indeksami;
   część wpisów dotyczy usuniętych lub niepodłączonych elementów.

## Zasady implementacji

- Logikę współdzieloną sklepu rozwijaj w `packages/commerce`: [granice i API](packages/commerce/README.md).
  Core nie może importować Reacta/Next.js ani plików aplikacji. Adapter zawiera
  GraphQL, hooki React korzystają z modeli core, konfigurację sklepu utrzymuj poza pakietem.
  Nie dodawaj globalnego singletonu danych klienta ani drugiej kopii stanu koszyka.

- Rozmawiaj i pisz treści interfejsu po polsku; identyfikatory kodu pozostaw po angielsku.
- Routing stron: `app/[...slug]/page.tsx` wybiera moduł z `lib/routing/Storefront.tsx`
  przez resolver `lib/routing/storefront.ts`. Nie dodawaj katalogów stron do `app`.
  Dozwolone katalogi to `[...slug]` i `api`; `/` ma cienkie wejście `app/page.tsx`.
  Szczegóły: [routing](docs/ROUTING.md).
- Zachowuj podział: `app` — wejścia Next.js i API; `views` — ekrany wraz z danymi
  i metadata; `lib/routing` — dopasowanie adresów i wybór widoku; `components` — UI;
  `lib` — logika/integracje; `queries` — dokumenty GraphQL; `types` — typy domenowe.
- Nie twórz osobnej warstwy `views/routes`. Prosty widok może być jednym plikiem;
  rozbudowany ma folder `views/NazwaView/` z wejściem serwerowym `index.tsx`,
  komponentem klienckim i lokalnymi hookami obok. Hook używany tylko przez jeden
  widok należy do jego folderu; `hooks` i commerce są dla logiki współdzielonej.
- Nie przenoś całych stron do klienta bez potrzeby. Dodawaj `"use client"` tam,
  gdzie zaczynają się interakcje/API przeglądarki. Używaj aliasu `@/` i strict TS.
- Korzystaj z istniejących przycisków, ikon, helperów cen i sanitizacji.
  Tailwind 4 i style globalne znajdują się w `app/globals.css`.
- Widoki SSR pobierają DTO przez `lib/server/views`, bez HTTP do własnego `/api`.
  Przeglądarka używa adaptera `packages/commerce/http` lub `storeApi` z `lib/api/client`.
  Kontrakty i walidatory są w `lib/api` i `packages/commerce/http/contracts.ts`.
  Nową operację dodaj jako kontrakt → serwis → adapter backendu → hook/komponent.
  Szczegóły: [API aplikacji](docs/API.md). Nie przywracaj publicznego proxy GraphQL.
- Integracje WP/Woo należą do `lib/server/wordpress` i serwerowego adaptera commerce.
  Operacje pisz w `.graphql`, potem uruchom `npm run graphql:generate`.
  Typy i dokumenty pochodzą z Codegen; nie edytuj obu `generated.ts` ani nie
  deklaruj ręcznie odpowiedzi GraphQL. Schemat odświeżaj jawnie przez
  `npm run graphql:schema`. [Procedura](docs/GRAPHQL.md).
  JWT i sesję WooCommerce obsługują route handlery; nie przenoś tokenów do
  localStorage ani kodu klienta. Stan `loggedIn` w UI nie jest autoryzacją.
- Zachowuj zabezpieczenia origin/content-type, cache prywatny, limity żądań,
  sanitizację HTML z WordPressa i sprawdzanie klucza zamówienia w PHP.
- Backend jest zewnętrzny. Nie zakładaj, że schemat GraphQL lub aktywne wtyczki
  odpowiadają samym źródłom w repo. Testy zamówień i płatności wykonuj na
  skonfigurowanym środowisku testowym w zakresie bieżącego zadania.
- Zmiana adresu WordPressa wymaga przejrzenia także fallbacku obrazów, CF7,
  konfiguracji obrazów/CSP i linków generowanych przez PHP — patrz stan projektu.
- Nie edytuj artefaktów `.next`, `build`, `node_modules`, `next-env.d.ts`.
  Nie zapisuj sekretów, cookies ani danych klientów w dokumentacji.

## Weryfikacja i utrzymanie kontekstu

- Node: `.nvmrc` (`v24.12.0` w chwili analizy). Menedżer: npm, lockfile:
  `package-lock.json`.
- Testy zachowań: `npm test`; dla checkoutu PHP także `npm run test:php`.
- Po zmianach GraphQL: `npm run graphql:check` (offline); sprawdzenie jest też
  częścią buildu. Schemat SDL i wygenerowane pliki przechowujemy w repo.
- Po zmianach TS/React: `npm run lint` oraz
  `./node_modules/.bin/tsc --noEmit --incremental false`; dla biblioteki także
  `./node_modules/.bin/tsc -p packages/commerce/tsconfig.json`.
- Build: `npm run build` pobiera dane z WordPressa. Sukces lint/TS nie dowodzi
  działania checkoutu ani integracji. Dobierz ręczne sprawdzenia do zmiany.
- `npm run build:release` buduje aplikację i odtwarza katalog `build`;
  `npm run start` uruchamia `build/server.js`, więc sam `npm run build` nie
  odświeża paczki używanej przez `start`.
- Aktualizuj odpowiedni dokument w `docs` przy zmianie przepływu, konfiguracji
  lub usunięciu opisanej luki. Zapisuj osobno fakty z kodu, wyniki sprawdzeń
  i kwestie wymagające potwierdzenia. Nie traktuj propozycji rozwoju jako
  automatycznego rozszerzenia zakresu zadania.
