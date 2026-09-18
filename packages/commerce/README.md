# Commerce — lokalna biblioteka sklepu

Pierwszym konsumentem jest Zabawne Koszulki. Biblioteka obejmuje katalog, koszyk,
dane checkoutu i finalizację. Nie ma zależności od plików aplikacji ani Next.js.
To prywatny pakiet źródłowy TypeScript: obecna aplikacja importuje go przez
`@/packages/commerce/...`; nie został opublikowany w npm i nie wymaga osobnego buildu.
`exports` opisują docelowe wejścia dla konsumenta obsługującego źródła TS.

## Podział

- `core/`: modele, kontrakt `CommerceAdapter`, zasoby i blokada zapisów,
  stronicowanie, repozytorium prób i kontroler finalizacji. Brak Reacta, cookies,
  routingu, tekstów sklepu i bezpośredniego dostępu do pamięci przeglądarki.
- `woocommerce/`: dokumenty `.graphql`, generowane typy i mapowanie odpowiedzi
  do modeli. Przyjmuje transport serwerowy; wymaga WooGraphQL i rozszerzeń poniżej.
- `http/`: kontrakty JSON, walidatory, klient HTTP i `createHttpCommerceAdapter`.
  Używany w przeglądarce; bez importów WooCommerce i Next.js.
- `react/`: `CommerceProvider`, `useCommerce`, `useResource`, `useCart`,
  `useProducts`, `useCheckout`, `usePlaceOrder`. Stan powstaje osobno w każdym
  providerze; nie ma globalnego singletonu danych klienta.

Kod podłączenia jest w aplikacji: `lib/store/browser.ts`, `contexts/StoreProvider.tsx`,
`lib/api/client.ts`, `lib/server/store.ts` oraz route handlery `app/api/`.
Szczegóły: [API aplikacji](../../docs/API.md).
JWT, HttpOnly cookies, origin, rate limiting i serwerowy cache pozostają w warstwie
Next.js. Biblioteka nie przenosi tokenów do klienta i nie zastępuje tych zabezpieczeń.

## Użycie

```tsx
import { useCart } from "@/packages/commerce/react";

function CartControls() {
  const { cart, count, busy, error, addItem, refresh } = useCart();
  // cart.items to tablica modeli; bez GraphQL contents.nodes/product.node.
  // Wyświetl lokalny komunikat dla error; nie ponawiaj automatycznie addItem.
  // await addItem({ productId: 123, variationId: 456, quantity: 1 });
  // Po błędzie: await refresh(), następnie pozwól klientowi zdecydować o zmianie.
}
```

`createCommerceStore(adapter, attempts, createId)` tworzy niezależny sklep.
`CommerceProvider` przyjmuje fabrykę `createStore`, a nie globalny obiekt sesji.
`createWooCommerceAdapter(transport)` przyjmuje transport nazwanych operacji;
`commerceDocuments` jest mapą do dołączenia do allowlisty po stronie serwera.
Mapa zawiera `TypedDocumentNode`, a `OperationTransport` wyprowadza z wybranej
operacji typ parametrów i wyniku. Nie przekazuj ręcznie deklarowanego typu odpowiedzi.
Generator i lokalny schemat obsługuje repo aplikacji: [GraphQL](../../docs/GRAPHQL.md).
Przeglądarka używa `createHttpCommerceAdapter(apiRequest)`; WooCommerce działa wyłącznie
na serwerze. Publiczny katalog SSR używa adaptera WooCommerce z transportem dopuszczającym
wyłącznie `Products` i cache zarządzanym przez aplikację.

`useProducts(filters, initial)` przyjmuje dane pierwszej strony z serwera;
zmiana filtrów lub danych początkowych tworzy nową listę. Filtry muszą być zwykłym
serializowalnym obiektem, a `initial` stabilnym obiektem props, nie kopią tworzoną
podczas każdego renderowania. URL i polskie etykiety obsługuje aplikacja.

`useCheckout()` zarządza danymi, zapisem adresów, dostawą i kuponami. Numer kroku,
brudne pola formularza, wybór faktury i paczkomatu należą do formularza sklepu.
`usePlaceOrder(checkAvailability)` zwraca wynik finalizacji lub odzyskania próby.
Aplikacja odpowiada za komunikat i przekierowanie. Funkcja sprawdzania dostępności
powinna mieć stabilną tożsamość. Potwierdzoną próbę usuń przez
`attempts.acknowledge(orderId)` dopiero po odczytaniu właściwego zamówienia.

## Gwarancje i ograniczenia

- Wspólny koszyk zasila widok, licznik i status produktu. Zapisy odświeżają dane;
  zmiana koszyka unieważnia checkout. Potwierdzony odczyt checkoutu zasila również
  koszyk, dzięki czemu ponowienie odczytu po awarii naprawia też licznik.
- Odczyty współdzielą żądanie. Odpowiedź sprzed zapisu lub zmiany sesji nie może
  nadpisać nowszego stanu. Koszyk i checkout współdzielą blokadę zapisów.
- Błąd zapisu blokuje następny zapis danego zasobu do czasu ponownego odczytu.
  Po błędzie dodania/usunięcia kuponu odczyt wykonywany jest automatycznie pod
  tą samą blokadą. Sukces odczytu przywraca gotowy checkout i koszyk, ale błąd
  operacji kuponu nadal trafia do formularza. Nieudany odczyt pozostawia blokadę
  kolejnych zmian do czasu ręcznego odświeżenia.
  Biblioteka nigdy automatycznie nie ponawia mutacji.
- Serwer odrzuca odpowiedzi GraphQL z `errors`. Klient HTTP dostaje własny kod
  błędu aplikacji; błędy walidacji formularza mają `CommerceError.code = validation`.
  UI prezentuje komunikat jako tekst; nie interpretuje błędów GraphQL.
- ID próby zamówienia jest zapisywane przed wysłaniem. Po nieznanym wyniku można
  odczytać stan próby, także po przeładowaniu; nie wolno wysyłać jej ponownie.
- Ceny i dostępność pochodzą z backendu. Formatted HTML z backendu trzeba
  sanitizować przy renderowaniu. UI może walidować formularz, ale wiążąca
  walidacja i deduplikacja zamówień muszą działać w WordPressie.
- Nie ma synchronizacji kart przeglądarki ani rozproszonej blokady po stronie JS.
  Serwerowa wtyczka odpowiada za deduplikację identycznego ID próby.
- Lista produktów korzysta z obsługi `found` i filtrów bieżącego WooGraphQL.
  Checkout ma obecne ograniczenie do pierwszego pakietu dostawy; obsługa wielu
  pakietów wymaga rozszerzenia modelu i UI, nie jest deklarowaną funkcją v0.1.

## Kontrakt backendu

Potrzebne są WordPress, WooCommerce, WPGraphQL i WPGraphQL for WooCommerce.
Finalizacja wymaga `wp-plugins/cd-checkout-graphql`, a powrót i wznowienie płatności
wtyczek `cd-order-received-graphql` i `cd-order-pay-graphql`.
To osobno instalowane elementy rozwiązania, nie część paczki JS. Wersje i hooki
należy sprawdzić integracyjnie; testy atrap nie potwierdzają zgodności każdej instalacji.
InPost wymaga konfiguracji konkretnej wtyczki i adaptera metadata po stronie PHP.
Biblioteka nie zakłada, że dowolna bramka albo plugin dostawy działa bez konfiguracji.

## Co pozostaje w sklepie

Branding, komponenty, SEO, analityka, zgody, CF7, reguły formularza, routing,
rozpoznawanie paczkomatów i konfiguracja atrybutów. Konto/JWT i szczegóły produktu
(w tym opinie) nadal korzystają z aplikacyjnych usług; nie są częścią publicznego API
biblioteki v0.1. `lib/catalog-pagination.ts` i hook licznika są cienkimi fasadami
kompatybilności. Dawne fasady zapytań `queries/*.ts` usunięto podczas migracji Codegen.

## Rozwój i sprawdzenia

Z katalogu repozytorium:

```bash
npm test
npm run lint
./node_modules/.bin/tsc -p packages/commerce/tsconfig.json
./node_modules/.bin/tsc --noEmit --incremental false
npm run build:release
```

Testy zachowań biblioteki: `tests/commerce.test.mjs`. Obejmują m.in. izolację
instancji, wyścigi odczytów i zapisów, niepewny wynik zamówienia oraz kontrakt adaptera.
Przy drugim sklepie najpierw potwierdź schemat i różnice integracji. Dopiero wtedy
ustabilizuj API i przygotuj osobne wydawanie pakietu; nie dodawaj fikcyjnych adapterów
ani rozszerzeń niewykorzystywanych przez żadnego konsumenta.
